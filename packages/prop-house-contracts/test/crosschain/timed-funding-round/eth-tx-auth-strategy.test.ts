import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  CANCEL_PROPOSAL_SELECTOR,
  fundingHouseTimedFundingRoundSetup,
  generateClaimLeaf,
  generateClaimMerkleTree,
  HOUSE_NAME,
  HOUSE_SYMBOL,
  CONTRACT_URI,
  METADATA_URI,
  ONE_DAY_SEC,
  ONE_ETHER,
  PROPOSE_SELECTOR,
  VOTE_SELECTOR,
} from '../../utils';
import { StarknetContractFactory } from 'starknet-hardhat-plugin-extended/dist/src/types';
import {
  // AssetType,
  FundingHouseStrategyType,
  getTimedFundingRoundProposeCalldata,
  getTimedFundingRoundCancelProposalCalldata,
  getTimedFundingRoundVoteCalldata,
  utils,
} from '@prophouse/sdk';
import { Account } from 'starknet-hardhat-plugin-extended/dist/src/account';
import {
  FundingHouse,
  FundingHouse__factory,
  HouseFactory,
  MockStarknetMessaging,
  StarkNetCommit,
  TimedFundingRound,
  TimedFundingRound__factory,
} from '../../../typechain';
import { starknet, ethers, network } from 'hardhat';
import { StarknetContract } from 'hardhat/types';
import { solidity } from 'ethereum-waffle';
import chai, { expect } from 'chai';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { constants } from 'ethers';

// TODO: Move
enum AssetType {
  Native,
  ERC20,
  ERC721,
  ERC1155,
}

chai.use(solidity);

describe('TimedFundingRoundStrategy - ETH Transaction Auth Strategy', () => {
  const networkUrl = network.config.url!;

  let timestamp: number;

  let fundingHouse: FundingHouse;
  let timedFundingRound: TimedFundingRound;

  let signer: SignerWithAddress;
  let starknetSigner: Account;

  // Contracts
  let houseFactory: HouseFactory;
  let mockStarknetMessaging: MockStarknetMessaging;
  let starknetCommit: StarkNetCommit;

  let timedFundingRoundContract: StarknetContract;
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
        ['string', 'string', 'string', 'address[]', 'address[]', 'tuple(uint256,uint256[])[]'],
        [
          HOUSE_NAME,
          HOUSE_SYMBOL,
          CONTRACT_URI,
          [signer.address],
          [config.timedFundingRoundImpl.address],
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

    fundingHouse = FundingHouse__factory.connect(fundingHouseAddress, signer);

    // fundingHouse = new FundingHouse(fundingHouseAddress, signer);

    // await fundingHouse.depositETH({ value: ONE_ETHER });

    const start = timestamp + ONE_DAY_SEC;
    const tx = await fundingHouse.createAndFundRound(
      // TODO: Create objects to pass
      config.timedFundingRoundImpl.address,
      defaultAbiCoder.encode(
        ['tuple(uint40,uint40,uint40,uint16,tuple(uint256,uint256)[])'],
        [[start, ONE_DAY_SEC, ONE_DAY_SEC, 1, [[AssetType.Native, ONE_ETHER]]]],
      ),
      [votingStrategyHash], // TODO: Rename to voting strategy ID
      'Test Round',
      'A round used for testing purposes',
      ['test', 'prop-house'],
      [
        {
          assetType: AssetType.Native,
          amount: ONE_ETHER,
          token: constants.AddressZero,
          identifier: 0,
        },
      ],
      {
        value: ONE_ETHER,
      },
    );
    // const tx = await fundingHouse.initiateRoundSimple({
    //   title: 'Test Round',
    //   description: 'A round used for testing purposes',
    //   tags: ['test', 'prop-house'],
    //   votingStrategies: [votingStrategyHash],
    //   strategy: {
    //     strategyType: FundingHouseStrategyType.TIMED_FUNDING_ROUND,
    //     config: {
    //       proposalPeriodStartTimestamp: start,
    //       proposalPeriodDuration: ONE_DAY_SEC,
    //       votePeriodDuration: ONE_DAY_SEC,
    //       winnerCount: 2,
    //     },
    //     validator: config.timedFundingRoundStrategyValidator.address,
    //   },
    //   awards: [
    //     {
    //       assetType: AssetType.ETH,
    //       amount: ONE_ETHER,
    //     },
    //   ],
    // });
    await tx.wait();

    timedFundingRound = TimedFundingRound__factory.connect(
      ethers.utils.getContractAddress({
        from: fundingHouse.address,
        nonce: 1,
      }),
      signer,
    );

    // Send the pending L1 -> L2 message
    await starknet.devnet.flush();

    const block = await starknet.getBlock({
      blockNumber: 'latest',
    });
    [, houseStrategyAddress] = block.transaction_receipts[0].events[0].data;

    timedFundingRoundContract = timedFundingRoundStrategyL2Factory.getContractAt(
      `0x${BigInt(houseStrategyAddress).toString(16)}`,
    );

    metadataUri = utils.intsSequence.IntsSequence.LEFromString(METADATA_URI);
    proposeCalldata = getTimedFundingRoundProposeCalldata(signer.address, METADATA_URI);
    voteCalldata = getTimedFundingRoundVoteCalldata(
      signer.address,
      [
        {
          proposalId: 1,
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
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(houseStrategyAddress, PROPOSE_SELECTOR, proposeCalldata),
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
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(houseStrategyAddress, PROPOSE_SELECTOR, proposeCalldata),
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
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(houseStrategyAddress, VOTE_SELECTOR, proposeCalldata),
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
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(houseStrategyAddress, PROPOSE_SELECTOR, proposeCalldata),
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

  it('should cancel a proposal using an Ethereum transaction', async () => {
    const proposeCalldata = getTimedFundingRoundProposeCalldata(
      signer.address,
      'Test cancel proposal!',
    );

    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(houseStrategyAddress, PROPOSE_SELECTOR, proposeCalldata),
    );
    // Check that the L1 -> L2 message has been propagated
    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    const proposeTxHash = await starknetSigner.invoke(ethTxAuth, 'authenticate', {
      target: houseStrategyAddress,
      function_selector: PROPOSE_SELECTOR,
      calldata: proposeCalldata,
    });
    const { events } = await starknet.getTransactionReceipt(proposeTxHash);
    const [proposalId] = events[0].data;

    let { is_cancelled } = await timedFundingRoundContract.call('get_proposal_info', {
      proposal_id: proposalId,
    });
    expect(parseInt(is_cancelled, 16)).to.equal(0);

    const cancelProposalCalldata = getTimedFundingRoundCancelProposalCalldata(
      signer.address,
      proposalId,
    );
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(
        houseStrategyAddress,
        CANCEL_PROPOSAL_SELECTOR,
        cancelProposalCalldata,
      ),
    );

    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    await starknetSigner.invoke(ethTxAuth, 'authenticate', {
      target: houseStrategyAddress,
      function_selector: CANCEL_PROPOSAL_SELECTOR,
      calldata: cancelProposalCalldata,
    });

    ({ is_cancelled } = await timedFundingRoundContract.call('get_proposal_info', {
      proposal_id: proposalId,
    }));
    expect(parseInt(is_cancelled, 16)).to.equal(1);
  });

  it('should create a vote using an Ethereum transaction', async () => {
    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(houseStrategyAddress, VOTE_SELECTOR, voteCalldata),
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

  it('should finalize a round and allow the winners to claim their awards', async () => {
    await starknet.devnet.increaseTime(ONE_DAY_SEC);

    await starknet.devnet.createBlock();

    // Finalize the round
    const assetId = utils.splitUint256.SplitUint256.fromUint(
      BigInt(AssetType.Native), // utils.encoding.getETHAssetID()
    );
    const amount = utils.splitUint256.SplitUint256.fromUint(ONE_ETHER.toBigInt());

    const txHash = await starknetSigner.invoke(timedFundingRoundContract, 'finalize_round', {
      awards: [
        {
          asset_id: assetId,
          amount,
        },
      ],
    });
    const { events } = await starknet.getTransactionReceipt(txHash);
    const [merkleRootLow, merkleRootHigh, winnersLen, ...winners] = events[0].data;

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

    const finalizeTx = timedFundingRound.finalizeRound(merkleRootLow, merkleRootHigh);

    await expect(finalizeTx).to.emit(timedFundingRound, 'RoundFinalized');

    const splitAmount = ONE_ETHER.div(2);
    const leaf1 = generateClaimLeaf({
      proposalId: winner1.proposalId,
      proposerAddress: signer.address,
      assetId: assetId.toHex(),
      assetAmount: splitAmount,
    });
    const leaf2 = generateClaimLeaf({
      proposalId: winner2.proposalId,
      proposerAddress: signer.address,
      assetId: assetId.toHex(),
      assetAmount: splitAmount,
    });
    const tree = generateClaimMerkleTree([leaf1, leaf2]);
    const proof1 = tree.getHexProof(leaf1);
    const proof2 = tree.getHexProof(leaf2);

    const claimTx1 = timedFundingRound.claimAward(
      winner1.proposalId,
      ONE_ETHER,
      {
        assetType: AssetType.Native,
        amount: ONE_ETHER,
        token: constants.AddressZero,
        identifier: 0,
      }, // utils.encoding.encodeETHAssetData(),
      proof1,
    );
    const claimTx2 = timedFundingRound.claimAward(
      winner2.proposalId,
      ONE_ETHER,
      {
        assetType: AssetType.Native,
        amount: ONE_ETHER,
        token: constants.AddressZero,
        identifier: 0,
      }, // utils.encoding.encodeETHAssetData(),
      proof2,
    );
    await Promise.all([
      expect(claimTx1)
        .to.emit(fundingHouse, 'AwardClaimed')
        .withArgs(winner1.proposalId, signer.address, assetId.toHex(), splitAmount, signer.address),
      expect(claimTx2)
        .to.emit(fundingHouse, 'AwardClaimed')
        .withArgs(winner2.proposalId, signer.address, assetId.toHex(), splitAmount, signer.address),
    ]);
  });
});
