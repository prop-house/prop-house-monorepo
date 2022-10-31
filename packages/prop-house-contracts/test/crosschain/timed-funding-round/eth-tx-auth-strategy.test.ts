import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  fundingHouseTimedFundingRoundSetup,
  ONE_DAY_SEC,
  ONE_ETHER,
  PROPOSE_SELECTOR,
  VOTE_SELECTOR,
} from '../../utils';
import { StarknetContractFactory } from 'starknet-hardhat-plugin-extended/dist/src/types';
import { Account } from 'starknet-hardhat-plugin-extended/dist/src/account';
import { IntsSequence } from '@snapshot-labs/sx/dist/utils/ints-sequence';
import {
  HouseFactory,
  FundingHouse,
  MockStarknetMessaging,
  StarkNetCommit,
} from '../../../typechain';
import { starknet, ethers, network } from 'hardhat';
import { StarknetContract } from 'hardhat/types';
import { BigNumberish } from 'ethers';
import { solidity } from 'ethereum-waffle';
import { utils } from '@snapshot-labs/sx';
import chai, { expect } from 'chai';
import { hash } from 'starknet';

chai.use(solidity);

interface ProposalVote {
  proposalID: number;
  votingPower: BigNumberish;
}

const getProposeCalldata = (proposerAddress: string, metadataUri: IntsSequence): string[] => {
  return [
    proposerAddress,
    `0x${metadataUri.bytesLength.toString(16)}`,
    `0x${metadataUri.values.length.toString(16)}`,
    ...metadataUri.values,
  ];
};

const getVoteCalldata = (
  voterAddress: string,
  proposalVotes: ProposalVote[],
  usedVotingStrategies: number[],
  usedVotingStrategyParams: string[][],
): string[] => {
  const usedVotingStrategyParamsFlat = utils.encoding.flatten2DArray(usedVotingStrategyParams);
  return [
    voterAddress,
    `0x${proposalVotes.length.toString(16)}`,
    ...proposalVotes
      .map(vote => {
        const { low, high } = utils.splitUint256.SplitUint256.fromUint(
          BigInt(vote.votingPower.toString()),
        );
        return [
          `0x${vote.proposalID.toString(16)}`,
          ethers.BigNumber.from(low).toHexString(),
          ethers.BigNumber.from(high).toHexString(),
        ];
      })
      .flat(),
    `0x${usedVotingStrategies.length.toString(16)}`,
    ...usedVotingStrategies.map(strategy => `0x${strategy.toString(16)}`),
    `0x${usedVotingStrategyParamsFlat.length.toString(16)}`,
    ...usedVotingStrategyParamsFlat,
  ];
};

describe('TimedFundingRoundStrategy - ETH Transaction Auth Strategy', () => {
  const networkUrl = network.config.url!;

  let timestamp: number;

  let signer: SignerWithAddress;
  let starknetSigner: Account;

  // Contracts
  let houseFactory: HouseFactory;
  let fundingHouse: FundingHouse;
  let mockStarknetMessaging: MockStarknetMessaging;
  let starknetCommit: StarkNetCommit;

  let timedFundingRound: StarknetContract;
  let ethTxAuth: StarknetContract;

  let timedFundingRoundStrategyL2Factory: StarknetContractFactory;

  let houseStrategyAddress: string;
  let metadataUri: utils.intsSequence.IntsSequence;
  let proposeCalldata: string[];
  let voteCalldata: string[];

  before(async () => {
    ({ timestamp } = await starknet.devnet.createBlock());

    [signer] = await ethers.getSigners();

    const config = await fundingHouseTimedFundingRoundSetup();
    ({
      houseFactory,
      timedFundingRoundEthTxAuthStrategy: ethTxAuth,
      timedFundingRoundStrategyL2Factory,
      mockStarknetMessaging,
      starknetCommit,
      starknetSigner,
    } = config);

    const vanillaVotingStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/common/voting/vanilla.cairo',
    );
    const vanillaVotingStrategy = await vanillaVotingStrategyFactory.deploy();

    await starknet.devnet.loadL1MessagingContract(networkUrl, mockStarknetMessaging.address);

    const creationResponse = await houseFactory.create(
      config.fundingHouseImpl.address,
      ethers.utils.defaultAbiCoder.encode(
        ['address[]', 'address[]', 'tuple(uint256,uint256[])[]'],
        [
          [config.timedFundingRoundStrategy.address],
          [signer.address],
          [[vanillaVotingStrategy.address, []]],
        ],
      ),
    );

    const creationReceipt = await creationResponse.wait();
    const [votingStrategyHash] = ethers.utils.defaultAbiCoder.decode(
      ['uint256', 'uint256', 'uint256[]'],
      creationReceipt.events?.[creationReceipt.events.length - 3].data!,
    );
    const [, fundingHouseAddress] =
      creationReceipt.events?.[creationReceipt.events.length - 1].args!;

    await starknet.devnet.flush();

    fundingHouse = config.fundingHouseImpl.attach(fundingHouseAddress);

    await fundingHouse.depositETH({ value: ONE_ETHER });

    const start = timestamp + ONE_DAY_SEC;
    const tx = await fundingHouse.initiateRound({
      title: 'Test Round',
      description: 'A round used for testing purposes',
      tags: ['test', 'prop-house'],
      strategy: config.timedFundingRoundStrategy.address,
      config: ethers.utils.defaultAbiCoder.encode(
        ['tuple(uint40,uint40,uint40,uint16)'], // TODO: SDK
        [[start, ONE_DAY_SEC, ONE_DAY_SEC, 5]],
      ),
      votingStrategies: [votingStrategyHash],
      awards: [
        {
          assetId: '0x8322fff200000000000000000000000000000000000000000000000000000000', // TODO: SDK
          amount: ONE_ETHER,
        },
      ],
    });
    await tx.wait();

    // Send the pending L1 -> L2 message
    await starknet.devnet.flush();

    const block = await starknet.getBlock({
      blockNumber: 'latest',
    });
    [, houseStrategyAddress] = block.transaction_receipts[0].events[0].data;

    timedFundingRound = timedFundingRoundStrategyL2Factory.getContractAt(
      `0x${BigInt(houseStrategyAddress).toString(16)}`,
    );

    metadataUri = utils.intsSequence.IntsSequence.LEFromString('My first proposal!');
    proposeCalldata = getProposeCalldata(signer.address, metadataUri);
    voteCalldata = getVoteCalldata(
      signer.address,
      [
        {
          proposalID: 1,
          votingPower: 1,
        },
      ],
      [0],
      [[]],
    );

    await starknet.devnet.increaseTime(ONE_DAY_SEC + 1);

    await starknet.devnet.createBlock();
  });

  it('should create a proposal using an Ethereum transaction', async () => {
    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit.connect(signer).commit(
      ethTxAuth.address,
      hash.computeHashOnElements([houseStrategyAddress, PROPOSE_SELECTOR, ...proposeCalldata]), // TODO: SDK, utils.encoding.getCommit
    );
    // Check that the L1 -> L2 message has been propagated
    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    // Creating proposal
    const txHash = await starknetSigner.invoke(ethTxAuth, 'authenticate', {
      target: houseStrategyAddress,
      function_selector: PROPOSE_SELECTOR,
      calldata: proposeCalldata,
    });
    const { events } = await starknet.getTransactionReceipt(txHash);
    const [proposalId, proposerAddress, metadataUriLength, ...actualMetadataUri] = events[0].data;

    expect(parseInt(proposalId, 16)).to.equal(1);
    expect(proposerAddress).to.equal(signer.address.toLowerCase());
    expect(parseInt(metadataUriLength, 16)).to.equal(3);

    for (let i = 0; i < actualMetadataUri.length; i++) {
      expect(actualMetadataUri[i]).to.equal(metadataUri.values[i]);
    }
  });

  it('should not allow the same commit to be executed multiple times', async () => {
    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit.connect(signer).commit(
      ethTxAuth.address,
      hash.computeHashOnElements([houseStrategyAddress, PROPOSE_SELECTOR, ...proposeCalldata]),
    );

    await starknet.devnet.flush();
    await starknetSigner.invoke(ethTxAuth, 'authenticate', {
      target: houseStrategyAddress,
      function_selector: PROPOSE_SELECTOR,
      calldata: proposeCalldata,
    });
    // Second attempt at calling authenticate should fail
    try {
      await starknetSigner.invoke(ethTxAuth, 'authenticate', {
        target: houseStrategyAddress,
        function_selector: PROPOSE_SELECTOR,
        calldata: proposeCalldata,
      });
      expect(true).to.equal(false); // This line should never be reached
    } catch (error: any) {
      expect(error.message).to.contain('Hash not yet committed or already executed');
    }
  });

  it('should fail if the correct hash of the payload is not committed on L1 before execution is called', async () => {
    await starknetCommit.connect(signer).commit(
      ethTxAuth.address,
      hash.computeHashOnElements([houseStrategyAddress, VOTE_SELECTOR, ...proposeCalldata]),
    ); // Wrong selector

    await starknet.devnet.flush();
    try {
      await starknetSigner.invoke(ethTxAuth, 'authenticate', {
        target: houseStrategyAddress,
        function_selector: PROPOSE_SELECTOR,
        calldata: proposeCalldata,
      });
      expect(true).to.equal(false); // This line should never be reached
    } catch (err: any) {
      expect(err.message).to.contain('Hash not yet committed or already executed');
    }
  });

  it('should fail if the commit sender address is not equal to the address in the payload', async () => {
    proposeCalldata[0] = ethers.Wallet.createRandom().address; // Random l1 address in the calldata
    await starknetCommit
      .connect(signer)
      .commit(
        ethTxAuth.address,
        hash.computeHashOnElements([houseStrategyAddress, PROPOSE_SELECTOR, ...proposeCalldata]),
      );

    await starknet.devnet.flush();
    try {
      await starknetSigner.invoke(ethTxAuth, 'authenticate', {
        target: houseStrategyAddress,
        function_selector: PROPOSE_SELECTOR,
        calldata: proposeCalldata,
      });
      expect(true).to.equal(false); // This line should never be reached
    } catch (err: any) {
      expect(err.message).to.contain('Commit made by invalid L1 address');
    }
  });

  it('should create a vote using an Ethereum transaction', async () => {
    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit
      .connect(signer)
      .commit(
        ethTxAuth.address,
        hash.computeHashOnElements([houseStrategyAddress, VOTE_SELECTOR, ...voteCalldata]),
      );
    // Check that the L1 -> L2 message has been propagated
    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    await starknet.devnet.increaseTime(ONE_DAY_SEC);

    await starknet.devnet.createBlock();

    // Cast vote
    const txHash = await starknetSigner.invoke(ethTxAuth, 'authenticate', {
      target: houseStrategyAddress,
      function_selector: VOTE_SELECTOR,
      calldata: voteCalldata,
    });
    const { events } = await starknet.getTransactionReceipt(txHash);
    const [proposalId, voterAddress, votingPower] = events[0].data;

    expect(parseInt(proposalId, 16)).to.equal(1);
    expect(voterAddress).to.equal(signer.address.toLowerCase());
    expect(parseInt(votingPower, 16)).to.equal(1);
  });

  it('should finalize a round', async () => {
    await starknet.devnet.increaseTime(ONE_DAY_SEC);

    await starknet.devnet.createBlock();

    const WORD_LENGTH = utils.splitUint256.SplitUint256.fromUint(BigInt(32));
    const AWARD_LENGTH = utils.splitUint256.SplitUint256.fromUint(BigInt(1));

    // Finalize the round
    const assetId = utils.splitUint256.SplitUint256.fromUint(
      BigInt('0x8322fff200000000000000000000000000000000000000000000000000000000'),
    );
    const amount = utils.splitUint256.SplitUint256.fromUint(ONE_ETHER.toBigInt());

    const txHash = await starknetSigner.invoke(timedFundingRound, 'finalize_round', {
      awards_flat: [WORD_LENGTH, AWARD_LENGTH, assetId, amount],
    });
    const { events } = await starknet.getTransactionReceipt(txHash);
    const [roundId, merkleRootLow, merkleRootHigh, winnersLen, ...winners] = events[0].data;

    expect(parseInt(roundId, 16)).to.equal(1);
    expect(merkleRootLow.length).to.equal(34);
    expect(merkleRootHigh.length).to.equal(34);
    expect(parseInt(winnersLen, 16)).to.equal(2);

    const winner1 = {
      proposalId: parseInt(winners[0], 16),
      proposerAddress: winners[1],
      proposalVotes: utils.splitUint256.SplitUint256.fromObj({
        low: winners[2],
        high: winners[3],
      }).toUint(),
    };
    expect(winner1.proposalId).to.equal(1);
    expect(winner1.proposerAddress).to.equal(signer.address.toLowerCase());
    expect(winner1.proposalVotes).to.equal(BigInt(1));

    const winner2 = {
      proposalId: parseInt(winners[4], 16),
      proposerAddress: winners[5],
      proposalVotes: utils.splitUint256.SplitUint256.fromObj({
        low: winners[6],
        high: winners[7],
      }).toUint(),
    };
    expect(winner2.proposalId).to.equal(2);
    expect(winner2.proposerAddress).to.equal(signer.address.toLowerCase());
    expect(winner2.proposalVotes).to.equal(BigInt(0));

    const { consumed_messages } = await starknet.devnet.flush();

    expect(consumed_messages.from_l2.length).to.equal(1);

    const finalizeTx = fundingHouse.finalizeRound(roundId, merkleRootLow, merkleRootHigh);

    await expect(finalizeTx).to.emit(fundingHouse, 'RoundFinalized').withArgs(roundId);
  });
});
