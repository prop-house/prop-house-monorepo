import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  DOMAIN,
  fundingHouseTimedFundingRoundSetup,
  METADATA_URI,
  ONE_DAY_SEC,
  ONE_ETHER,
  Propose,
  PROPOSE_SELECTOR,
  PROPOSE_TYPES,
  Vote,
  VOTE_SELECTOR,
  VOTE_TYPES,
} from '../../utils';
import { StarknetContractFactory } from 'starknet-hardhat-plugin-extended/dist/src/types';
import { AssetType, assetUtils, FundingHouse, FundingHouseStrategyType } from '@prophouse/sdk';
import { Account } from 'starknet-hardhat-plugin-extended/dist/src/account';
import { IntsSequence } from '@snapshot-labs/sx/dist/utils/ints-sequence';
import { HouseFactory, MockStarknetMessaging } from '../../../typechain';
import { computeHashOnElements } from 'starknet/dist/utils/hash';
import { starknet, ethers, network } from 'hardhat';
import { StarknetContract } from 'hardhat/types';
import { BigNumberish } from 'ethers';
import { solidity } from 'ethereum-waffle';
import { utils } from '@snapshot-labs/sx';
import chai, { expect } from 'chai';

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

describe('TimedFundingRoundStrategy - ETH Signature Auth Strategy', () => {
  const networkUrl = network.config.url!;

  let timestamp: number;

  let signer: SignerWithAddress;
  let starknetSigner: Account;

  // Contracts
  let houseFactory: HouseFactory;
  let fundingHouse: FundingHouse;
  let mockStarknetMessaging: MockStarknetMessaging;

  let timedFundingRound: StarknetContract;
  let ethSigAuth: StarknetContract;

  let timedFundingRoundStrategyL2Factory: StarknetContractFactory;

  let houseStrategyAddress: string;
  let metadataUri: utils.intsSequence.IntsSequence;
  let proposeCalldata: string[];
  let voteCalldata: string[];
  let usedVotingStrategiesHash: string;
  let userVotingStrategyParamsFlatHash: string;

  before(async () => {
    ({ timestamp } = await starknet.devnet.createBlock());

    [signer] = await ethers.getSigners();

    const config = await fundingHouseTimedFundingRoundSetup();
    ({
      houseFactory,
      timedFundingRoundEthSigAuthStrategy: ethSigAuth,
      timedFundingRoundStrategyL2Factory,
      mockStarknetMessaging,
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
          [config.timedFundingRoundStrategyValidator.address],
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

    fundingHouse = new FundingHouse(fundingHouseAddress, signer);

    await fundingHouse.depositETH({ value: ONE_ETHER });

    const start = timestamp + ONE_DAY_SEC;
    const tx = await fundingHouse.initiateRoundSimple({
      title: 'Test Round',
      description: 'A round used for testing purposes',
      tags: ['test', 'prop-house'],
      votingStrategies: [votingStrategyHash],
      strategy: {
        strategyType: FundingHouseStrategyType.TIMED_FUNDING_ROUND,
        config: {
          proposalPeriodStartTimestamp: start,
          proposalPeriodDuration: ONE_DAY_SEC,
          votePeriodDuration: ONE_DAY_SEC,
          winnerCount: 5,
        },
        validator: config.timedFundingRoundStrategyValidator.address,
      },
      awards: [
        {
          assetType: AssetType.ETH,
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

    metadataUri = utils.intsSequence.IntsSequence.LEFromString(METADATA_URI);
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
    usedVotingStrategiesHash = computeHashOnElements(['0x0']);
    userVotingStrategyParamsFlatHash = computeHashOnElements(utils.encoding.flatten2DArray([[]]));

    await starknet.devnet.increaseTime(ONE_DAY_SEC + 1);

    await starknet.devnet.createBlock();
  });

  it('should create a proposal using an Ethereum signature', async () => {
    const salt = utils.splitUint256.SplitUint256.fromHex('0x01');
    const message: Propose = {
      auth_strategy: ethers.utils.hexZeroPad(ethSigAuth.address, 32),
      house_strategy: ethers.utils.hexZeroPad(timedFundingRound.address, 32),
      author: signer.address,
      metadata_uri: METADATA_URI,
      salt: salt.toHex(),
    };
    const sig = await signer._signTypedData(DOMAIN, PROPOSE_TYPES, message);
    const { r, s, v } = utils.encoding.getRSVFromSig(sig);
    const txHash = await starknetSigner.invoke(ethSigAuth, 'authenticate', {
      r,
      s,
      v,
      salt,
      target: timedFundingRound.address,
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

  it('should not authenticate an invalid signature', async () => {
    const salt = utils.splitUint256.SplitUint256.fromHex('0x01');
    const message: Propose = {
      auth_strategy: ethers.utils.hexZeroPad(ethSigAuth.address, 32),
      house_strategy: ethers.utils.hexZeroPad(timedFundingRound.address, 32),
      author: signer.address,
      metadata_uri: METADATA_URI,
      salt: salt.toHex(),
    };
    const badProposeCalldata = [...proposeCalldata];
    const sig = await signer._signTypedData(DOMAIN, PROPOSE_TYPES, message);
    const { r, s, v } = utils.encoding.getRSVFromSig(sig);

    // Data is signed with accounts[0] but the proposer is accounts[1] so it should fail
    const [, signer2] = await ethers.getSigners();
    badProposeCalldata[0] = signer2.address;

    try {
      await starknetSigner.invoke(ethSigAuth, 'authenticate', {
        r,
        s,
        v,
        salt,
        target: timedFundingRound.address,
        function_selector: PROPOSE_SELECTOR,
        calldata: badProposeCalldata,
      });
      expect(true).to.equal(false); // This line should never be reached
    } catch (error: any) {
      expect(error.message).to.contain('Invalid signature.');
    }
  });

  it('should create a vote using an Ethereum transaction', async () => {
    await starknet.devnet.increaseTime(ONE_DAY_SEC);
    await starknet.devnet.createBlock();

    const salt = utils.splitUint256.SplitUint256.fromHex('0x02');
    const proposalVotes = [
      {
        proposalID: 1,
        votingPower: 1,
      },
    ];
    const proposalVotesHash = utils.encoding.hexPadRight(
      computeHashOnElements(
        proposalVotes
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
      ),
    );
    const usedVotingStrategiesHashPadded = utils.encoding.hexPadRight(usedVotingStrategiesHash);
    const userVotingStrategyParamsFlatHashPadded = utils.encoding.hexPadRight(
      userVotingStrategyParamsFlatHash,
    );
    const message: Vote = {
      auth_strategy: ethers.utils.hexZeroPad(ethSigAuth.address, 32),
      house_strategy: ethers.utils.hexZeroPad(timedFundingRound.address, 32),
      voter: signer.address,
      proposal_votes_hash: proposalVotesHash,
      strategies_hash: usedVotingStrategiesHashPadded,
      strategies_params_hash: userVotingStrategyParamsFlatHashPadded,
      salt: salt.toHex(),
    };
    const sig = await signer._signTypedData(DOMAIN, VOTE_TYPES, message);
    const { r, s, v } = utils.encoding.getRSVFromSig(sig);
    const txHash = await starknetSigner.invoke(ethSigAuth, 'authenticate', {
      r,
      s,
      v,
      salt,
      target: timedFundingRound.address,
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
    const assetId = utils.splitUint256.SplitUint256.fromUint(BigInt(assetUtils.getETHAssetID()));
    const amount = utils.splitUint256.SplitUint256.fromUint(ONE_ETHER.toBigInt());

    const txHash = await starknetSigner.invoke(timedFundingRound, 'finalize_round', {
      awards_flat: [WORD_LENGTH, AWARD_LENGTH, assetId, amount],
    });
    const { events } = await starknet.getTransactionReceipt(txHash);
    const [roundId, merkleRootLow, merkleRootHigh, winnersLen, ...winners] = events[0].data;

    expect(parseInt(roundId, 16)).to.equal(1);
    expect(merkleRootLow.length).to.equal(34);
    expect(merkleRootHigh.length).to.equal(34);
    expect(parseInt(winnersLen, 16)).to.equal(1);

    const winner = {
      proposalId: parseInt(winners[0], 16),
      proposerAddress: winners[1],
      proposalVotes: utils.splitUint256.SplitUint256.fromObj({
        low: winners[2],
        high: winners[3],
      }).toUint(),
    };
    expect(winner.proposalId).to.equal(1);
    expect(winner.proposerAddress).to.equal(signer.address.toLowerCase());
    expect(winner.proposalVotes).to.equal(BigInt(1));

    const { consumed_messages } = await starknet.devnet.flush();

    expect(consumed_messages.from_l2.length).to.equal(1);

    const finalizeTx = fundingHouse.finalizeRound(roundId, merkleRootLow, merkleRootHigh);

    await expect(finalizeTx).to.emit(fundingHouse, 'RoundFinalized').withArgs(roundId);
  });
});
