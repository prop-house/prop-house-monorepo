import { StarknetContractFactory } from 'starknet-hardhat-plugin-extended/dist/src/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  timedRoundSetup,
  generateClaimLeaf,
  generateClaimMerkleTree,
  CONTRACT_URI,
  METADATA_URI,
  ONE_DAY_SEC,
  ONE_ETHER,
  PROPOSE_SELECTOR,
  VOTE_SELECTOR,
  CANCEL_PROPOSAL_SELECTOR,
  getStarknetArtifactPaths,
  STARKNET_MAX_FEE,
  asciiToHex,
} from '../../utils';
import {
  AssetType,
  HouseType,
  RoundType,
  VotingStrategyType,
  PropHouse,
  utils,
  Asset,
  ContractAddresses,
  TimedRoundContract,
  TimedRound__factory,
} from '@prophouse/sdk';
import * as gql from '@prophouse/sdk/dist/gql';
import * as addresses from '@prophouse/protocol/dist/src/addresses';
import { GovPowerStrategyType as GQLGovPowerStrategyType } from '@prophouse/sdk/dist/gql/evm/graphql';
import { MockStarknetMessaging, StarkNetCommit } from '../../../typechain';
import hre, { starknet, ethers, network } from 'hardhat';
import { StarknetContract } from 'hardhat/types';
import { solidity } from 'ethereum-waffle';
import { BigNumber, constants } from 'ethers';
import { Account, hash, stark } from 'starknet';
import chai, { expect } from 'chai';

chai.use(solidity);

describe('TimedRoundStrategy - ETH Transaction Auth Strategy', () => {
  const networkUrl = network.config.url!;

  let signer: SignerWithAddress;
  let starknetAccount: Account;

  let propHouse: PropHouse;
  let timedRound: TimedRoundContract;
  let mockStarknetMessaging: MockStarknetMessaging;
  let starknetCommit: StarkNetCommit;

  let timedRoundContract: StarknetContract;
  let timedRoundEthTxAuthStrategy: StarknetContract;

  let timedRoundL2Factory: StarknetContractFactory;

  let l2RoundAddress: string;
  let vanillaGovPowerStrategyId: string;

  before(async () => {
    await starknet.devnet.restart();

    const { block_timestamp } = await starknet.devnet.setTime(Math.floor(Date.now() / 1000));

    [signer] = await ethers.getSigners();

    const config = await timedRoundSetup();
    ({
      timedRoundEthTxAuthStrategy,
      timedRoundL2Factory,
      mockStarknetMessaging,
      starknetAccount,
      starknetCommit,
    } = config);

    const vanillaGovPowerStrategyMetadata = getStarknetArtifactPaths(
      'VanillaGovernancePowerStrategy',
    );
    const vanillaGovPowerStrategyFactory = new StarknetContractFactory({
      hre,
      abiPath: vanillaGovPowerStrategyMetadata.sierra,
      metadataPath: vanillaGovPowerStrategyMetadata.sierra,
      casmPath: vanillaGovPowerStrategyMetadata.casm,
    });
    await config.starknetSigner.declare(vanillaGovPowerStrategyFactory, {
      maxFee: STARKNET_MAX_FEE,
    });

    const vanillaGovPowerStrategy = await config.starknetSigner.deploy(
      vanillaGovPowerStrategyFactory,
    );
    vanillaGovPowerStrategyId = hash.computeHashOnElements([vanillaGovPowerStrategy.address]);

    // Stub `getRoundVotingStrategies`
    gql.QueryWrapper.prototype.getRoundVotingStrategies = () =>
      Promise.resolve({
        govPowerStrategies: [
          {
            id: hash.computeHashOnElements([vanillaGovPowerStrategy.address]),
            type: GQLGovPowerStrategyType.Vanilla,
            address: vanillaGovPowerStrategy.address,
            params: [],
          },
        ],
      });

    // Override contract addresses
    (addresses.getContractAddressesForChainOrThrow as Function) = (): ContractAddresses => {
      return {
        evm: {
          prophouse: config.propHouse.address,
          messenger: config.messenger.address,
          house: {
            community: config.communityHouseImpl.address,
          },
          round: {
            timed: config.timedRoundImpl.address,
          },
        },
        starknet: {
          roundFactory: config.roundFactory.address,
          strategyRegistry: config.strategyRegistry.address,
          govPower: {
            allowlist: constants.HashZero,
            balanceOf: constants.HashZero,
            vanilla: vanillaGovPowerStrategy.address,
          },
          auth: {
            timedEthSig: config.timedRoundEthSigAuthStrategy.address,
            timedEthTx: config.timedRoundEthTxAuthStrategy.address,
          },
          herodotus: {
            factRegistry: '',
            l1HeadersStore: '',
          },
          classHashes: {
            timed: config.timedRoundClassHash,
          },
        },
      };
    };

    propHouse = new PropHouse({
      evmChainId: await signer.getChainId(),
      starknet: config.starknetProvider,
      evm: signer,
    });
    await starknet.devnet.loadL1MessagingContract(networkUrl, mockStarknetMessaging.address);

    const asset: Asset = {
      assetType: AssetType.ETH,
      amount: ONE_ETHER,
    };
    const creationResponse = await propHouse.createAndFundRoundOnNewHouse(
      {
        houseType: HouseType.COMMUNITY,
        config: {
          contractURI: CONTRACT_URI,
        },
      },
      {
        roundType: RoundType.TIMED,
        title: 'Test Round',
        description: 'A round used for testing purposes',
        config: {
          awards: [asset],
          votingStrategies: [
            {
              strategyType: VotingStrategyType.VANILLA,
            },
          ],
          proposalPeriodStartUnixTimestamp: block_timestamp + ONE_DAY_SEC,
          proposalPeriodDurationSecs: ONE_DAY_SEC,
          votePeriodDurationSecs: ONE_DAY_SEC,
          winnerCount: 1,
        },
      },
      [asset],
    );

    const creationReceipt = await creationResponse.wait();
    const [, , roundAddress] = creationReceipt.events!.find(
      ({ event }) => event === 'RoundCreated',
    )!.args!;

    await starknet.devnet.flush();

    timedRound = TimedRound__factory.connect(roundAddress, signer);

    // Send the pending L1 -> L2 message
    await starknet.devnet.flush();

    const block = await starknet.getBlock({
      blockNumber: 'latest',
    });
    [, l2RoundAddress] = block.transaction_receipts[0].events[1].data;

    timedRoundContract = timedRoundL2Factory.getContractAt(
      `0x${BigInt(l2RoundAddress).toString(16)}`,
    );

    await starknet.devnet.increaseTime(ONE_DAY_SEC + 1);
    await starknet.devnet.createBlock();
  });

  it('should create a proposal using an Ethereum transaction', async () => {
    const proposeCalldata = propHouse.round.timed.getProposeCalldata({
      proposer: signer.address,
      metadataUri: METADATA_URI,
      usedProposingStrategies: [],
    });

    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit.commit(
      timedRoundEthTxAuthStrategy.address,
      utils.encoding.getCommit(l2RoundAddress, PROPOSE_SELECTOR, proposeCalldata),
      {
        value: STARKNET_MAX_FEE,
      },
    );

    // Check that the L1 -> L2 message has been propagated
    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    // Create the proposal
    const { transaction_hash } = await starknetAccount.execute({
      contractAddress: timedRoundEthTxAuthStrategy.address,
      entrypoint: 'authenticate_propose',
      calldata: [l2RoundAddress, ...proposeCalldata],
    });

    const { events } = await starknet.getTransactionReceipt(transaction_hash);
    const [proposalId, proposerAddress, metadataUriLength, ...actualMetadataUri] = events[0].data;

    expect(parseInt(proposalId, 16)).to.equal(1);
    expect(proposerAddress).to.equal(signer.address.toLowerCase());
    expect(parseInt(metadataUriLength, 16)).to.equal(3);

    const expectedMetadataUri = utils.intsSequence.IntsSequence.LEFromString(METADATA_URI);
    for (let i = 0; i < actualMetadataUri.length; i++) {
      expect(actualMetadataUri[i]).to.equal(expectedMetadataUri.values[i]);
    }
  });

  it('should not allow the same commit to be executed multiple times', async () => {
    const proposeCalldata = propHouse.round.timed.getProposeCalldata({
      proposer: signer.address,
      metadataUri: METADATA_URI,
      usedProposingStrategies: [],
    });

    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit.commit(
      timedRoundEthTxAuthStrategy.address,
      utils.encoding.getCommit(l2RoundAddress, PROPOSE_SELECTOR, proposeCalldata),
      {
        value: STARKNET_MAX_FEE,
      },
    );

    await starknet.devnet.flush();
    await starknetAccount.execute({
      contractAddress: timedRoundEthTxAuthStrategy.address,
      entrypoint: 'authenticate_propose',
      calldata: [l2RoundAddress, ...proposeCalldata],
    });

    try {
      // Second attempt at calling authenticate should fail
      await starknetAccount.execute({
        contractAddress: timedRoundEthTxAuthStrategy.address,
        entrypoint: 'authenticate_propose',
        calldata: [l2RoundAddress, ...proposeCalldata],
      });
      expect(true).to.equal(false); // This line should never be reached
    } catch (error: any) {
      expect(error.message).to.contain(asciiToHex('EthereumTx: Unknown sender/hash'));
    }
  });

  it('should fail if the correct hash of the payload is not committed on L1 before execution is called', async () => {
    const proposeCalldata = propHouse.round.timed.getProposeCalldata({
      proposer: signer.address,
      metadataUri: METADATA_URI,
      usedProposingStrategies: [],
    });

    // Wrong selector
    await starknetCommit.commit(
      timedRoundEthTxAuthStrategy.address,
      utils.encoding.getCommit(l2RoundAddress, VOTE_SELECTOR, proposeCalldata),
      {
        value: STARKNET_MAX_FEE,
      },
    );

    await starknet.devnet.flush();
    try {
      await starknetAccount.execute({
        contractAddress: timedRoundEthTxAuthStrategy.address,
        entrypoint: 'authenticate_propose',
        calldata: [l2RoundAddress, ...proposeCalldata],
      });
      expect(true).to.equal(false); // This line should never be reached
    } catch (error: any) {
      expect(error.message).to.contain(asciiToHex('EthereumTx: Unknown sender/hash'));
    }
  });

  it('should fail if the commit sender address is not equal to the address in the payload', async () => {
    const proposeCalldata = propHouse.round.timed.getProposeCalldata({
      proposer: ethers.Wallet.createRandom().address, // Random l1 address in the calldata
      metadataUri: METADATA_URI,
      usedProposingStrategies: [],
    });

    await starknetCommit.commit(
      timedRoundEthTxAuthStrategy.address,
      utils.encoding.getCommit(l2RoundAddress, PROPOSE_SELECTOR, proposeCalldata),
      {
        value: STARKNET_MAX_FEE,
      },
    );

    await starknet.devnet.flush();
    try {
      await starknetAccount.execute({
        contractAddress: timedRoundEthTxAuthStrategy.address,
        entrypoint: 'authenticate_propose',
        calldata: [l2RoundAddress, ...proposeCalldata],
      });
      expect(true).to.equal(false); // This line should never be reached
    } catch (error: any) {
      expect(error.message).to.contain(asciiToHex('EthereumTx: Unknown sender/hash'));
    }
  });

  it('should cancel a proposal using an Ethereum transaction', async () => {
    const proposeCalldata = propHouse.round.timed.getProposeCalldata({
      proposer: signer.address,
      metadataUri: 'Test cancel proposal!',
      usedProposingStrategies: [],
    });

    await starknetCommit.commit(
      timedRoundEthTxAuthStrategy.address,
      utils.encoding.getCommit(l2RoundAddress, PROPOSE_SELECTOR, proposeCalldata),
      {
        value: STARKNET_MAX_FEE,
      },
    );

    // Check that the L1 -> L2 message has been propagated
    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    const { transaction_hash } = await starknetAccount.execute({
      contractAddress: timedRoundEthTxAuthStrategy.address,
      entrypoint: 'authenticate_propose',
      calldata: [l2RoundAddress, ...proposeCalldata],
    });

    const { events } = await starknet.getTransactionReceipt(transaction_hash);
    const [proposalId] = events[0].data;

    let { response } = await timedRoundContract.call('get_proposal', {
      proposal_id: proposalId,
    });
    expect(response.is_cancelled).to.equal(false);

    const cancelCalldata = stark.compileCalldata({
      proposer: signer.address,
      proposal_id: proposalId,
    });
    await starknetCommit.commit(
      timedRoundEthTxAuthStrategy.address,
      utils.encoding.getCommit(l2RoundAddress, CANCEL_PROPOSAL_SELECTOR, cancelCalldata),
      {
        value: STARKNET_MAX_FEE,
      },
    );

    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    await starknetAccount.execute({
      contractAddress: timedRoundEthTxAuthStrategy.address,
      entrypoint: 'authenticate_cancel_proposal',
      calldata: [l2RoundAddress, ...cancelCalldata],
    });

    ({ response } = await timedRoundContract.call('get_proposal', {
      proposal_id: proposalId,
    }));
    expect(response.is_cancelled).to.equal(true);
  });

  it('should create a vote using an Ethereum transaction', async () => {
    const voteCalldata = propHouse.round.timed.getVoteCalldata({
      voter: signer.address,
      proposalVotes: [
        {
          proposalId: 1,
          votingPower: 1,
        },
      ],
      usedVotingStrategies: [
        {
          id: vanillaGovPowerStrategyId,
          userParams: [],
        },
      ],
    });

    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit.commit(
      timedRoundEthTxAuthStrategy.address,
      utils.encoding.getCommit(l2RoundAddress, VOTE_SELECTOR, voteCalldata),
      {
        value: STARKNET_MAX_FEE,
      },
    );
    // Check that the L1 -> L2 message has been propagated
    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    await starknet.devnet.increaseTime(ONE_DAY_SEC);
    await starknet.devnet.createBlock();

    // Cast vote
    const { transaction_hash } = await starknetAccount.execute({
      contractAddress: timedRoundEthTxAuthStrategy.address,
      entrypoint: 'authenticate_vote',
      calldata: [l2RoundAddress, ...voteCalldata],
    });
    const { events } = await starknet.getTransactionReceipt(transaction_hash);
    const [proposalId, voterAddress, votingPower] = events[0].data;

    expect(parseInt(proposalId, 16)).to.equal(1);
    expect(voterAddress).to.equal(signer.address.toLowerCase());
    expect(parseInt(votingPower, 16)).to.equal(1);
  });

  it('should finalize a round and allow the winner to claim their award', async () => {
    await starknet.devnet.increaseTime(ONE_DAY_SEC);
    await starknet.devnet.createBlock();

    // Finalize the round
    const assetId = utils.splitUint256.SplitUint256.fromUint(
      BigInt(utils.encoding.getETHAssetID()),
    );
    const amount = utils.splitUint256.SplitUint256.fromUint(ONE_ETHER.toBigInt());

    const { transaction_hash } = await propHouse.round.timed.finalizeRound(starknetAccount, {
      round: timedRoundContract.address,
      awards: [{ assetId, amount }],
    });
    const { events } = await starknet.getTransactionReceipt(transaction_hash);
    const winnersLen = parseInt(events[0].data[0], 16);
    const winningProposalIds = events[0].data.slice(1, -2).map(id => parseInt(id, 16));
    const merkleRootLow = events[0].data.at(-2)!;
    const merkleRootHigh = events[0].data.at(-1)!;

    expect(merkleRootLow.length).to.equal(34);
    expect(merkleRootHigh.length).to.equal(34);
    expect(winnersLen).to.equal(1);
    expect(winningProposalIds).to.have.a.lengthOf(1);

    const { response } = await timedRoundContract.call('get_proposal', {
      proposal_id: winningProposalIds[0],
    });

    const winner = {
      position: 1,
      proposalId: winningProposalIds[0],
      proposer: BigNumber.from(response.proposer).toHexString(),
      votingPower: response.voting_power,
    };
    expect(winner.proposalId).to.equal(1);
    expect(winner.proposer).to.equal(signer.address.toLowerCase());
    expect(winner.votingPower).to.equal(BigInt(1));

    const { consumed_messages } = await starknet.devnet.flush();

    expect(consumed_messages.from_l2.length).to.equal(1);

    const finalizeTx = timedRound.finalize(merkleRootLow, merkleRootHigh);

    await expect(finalizeTx).to.emit(timedRound, 'RoundFinalized');

    const leaf = generateClaimLeaf({
      proposalId: winner.proposalId,
      position: winner.position,
      proposer: signer.address,
      assetId: utils.encoding.getETHAssetID(),
      assetAmount: amount.toHex(),
    });
    const tree = generateClaimMerkleTree([leaf]);
    const proof = tree.getHexProof(leaf);
    const claimTx = timedRound.claim(
      winner.proposalId,
      winner.position,
      {
        assetType: AssetType.ETH,
        amount: ONE_ETHER,
        token: constants.AddressZero,
        identifier: 0,
      },
      proof,
    );
    await expect(claimTx)
      .to.emit(timedRound, 'AssetClaimed')
      .withArgs(winner.proposalId, signer.address, signer.address, [assetId.toHex(), amount.toHex()]);
  });
});
