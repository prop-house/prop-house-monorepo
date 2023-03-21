import { StarknetContractFactory } from 'starknet-hardhat-plugin-extended/dist/src/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  timedFundingRoundSetup,
  generateClaimLeaf,
  generateClaimMerkleTree,
  CONTRACT_URI,
  METADATA_URI,
  ONE_DAY_SEC,
  ONE_ETHER,
  PROPOSE_SELECTOR,
  VOTE_SELECTOR,
  CANCEL_PROPOSAL_SELECTOR,
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
  TimedFundingRoundContract,
  TimedFundingRound__factory,
} from '@prophouse/sdk';
import * as gql from '@prophouse/sdk/dist/gql';
import * as addresses from '@prophouse/contracts/dist/src/addresses';
import { VotingStrategyType as GQLVotingStrategyType } from '@prophouse/sdk/dist/gql/evm/graphql';
import { MockStarknetMessaging, StarkNetCommit } from '../../../typechain';
import { starknet, ethers, network } from 'hardhat';
import { StarknetContract } from 'hardhat/types';
import { solidity } from 'ethereum-waffle';
import { BigNumber, BigNumberish, constants, Wallet } from 'ethers';
import { Account, hash, stark } from 'starknet';
import chai, { expect } from 'chai';

chai.use(solidity);

/**
 * Generates a calldata array for cancelling a proposal through an authenticator
 * @param proposer The address of the proposal creator
 * @param proposalId The ID of the proposal to cancel
 */
const getTimedFundingRoundCancelProposalCalldata = (
  proposer: string,
  proposalId: BigNumberish,
): string[] => {
  return [proposer, BigNumber.from(proposalId).toHexString()];
};

describe('TimedFundingRoundStrategy - ETH Transaction Auth Strategy', () => {
  const networkUrl = network.config.url!;

  let timestamp: number;

  let signer: SignerWithAddress;
  let starknetAccount: Account;

  let propHouse: PropHouse;
  let timedFundingRound: TimedFundingRoundContract;
  let mockStarknetMessaging: MockStarknetMessaging;
  let starknetCommit: StarkNetCommit;

  let timedFundingRoundContract: StarknetContract;
  let ethTxAuth: StarknetContract;

  let timedFundingRoundL2Factory: StarknetContractFactory;

  let l2RoundAddress: string;
  let proposeCalldata: string[];
  let vanillaVotingStrategyId: string;

  before(async () => {
    ({ timestamp } = await starknet.devnet.createBlock());

    [signer] = await ethers.getSigners();

    const config = await timedFundingRoundSetup();
    ({
      timedFundingRoundEthTxAuthStrategy: ethTxAuth,
      timedFundingRoundL2Factory,
      mockStarknetMessaging,
      starknetAccount,
      starknetCommit,
    } = config);

    const vanillaVotingStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/common/voting/vanilla.cairo',
    );
    await config.starknetSigner.declare(vanillaVotingStrategyFactory);

    const vanillaVotingStrategy = await config.starknetSigner.deploy(vanillaVotingStrategyFactory);
    vanillaVotingStrategyId = hash.computeHashOnElements([vanillaVotingStrategy.address]);

    // Stub `getRoundVotingStrategies`
    gql.QueryWrapper.prototype.getRoundVotingStrategies = () =>
      Promise.resolve({
        votingStrategies: [
          {
            id: hash.computeHashOnElements([vanillaVotingStrategy.address]),
            type: GQLVotingStrategyType.Vanilla,
            address: vanillaVotingStrategy.address,
            params: [],
          },
        ],
      });

    // Override contract addresses
    (addresses.getContractAddressesForChainOrThrow as Function) = (): ContractAddresses => {
      return {
        evm: {
          prophouse: config.propHouse.address,
          house: {
            community: config.communityHouseImpl.address,
          },
          round: {
            timedFunding: config.timedFundingRoundImpl.address,
          },
        },
        starknet: {
          votingRegistry: config.votingStrategyRegistry.address,
          voting: {
            balanceOf: '',
            whitelist: '',
            vanilla: vanillaVotingStrategy.address,
          },
          auth: {
            timedFundingEthSig: config.timedFundingRoundEthSigAuthStrategy.address,
            timedFundingEthTx: config.timedFundingRoundEthTxAuthStrategy.address,
          },
          fossil: {
            factRegistry: '',
            l1HeadersStore: '',
          },
          classHashes: {
            timedFunding: config.timedFundingRoundClassHash,
          },
        },
      };
    };

    propHouse = new PropHouse({
      evmChainId: await signer.getChainId(),
      evm: signer as unknown as Wallet,
    });
    proposeCalldata = propHouse.round.timedFunding.getProposeCalldata({
      proposer: signer.address,
      metadataUri: METADATA_URI,
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
        roundType: RoundType.TIMED_FUNDING,
        title: 'Test Round',
        description: 'A round used for testing purposes',
        config: {
          awards: [asset],
          strategies: [
            {
              strategyType: VotingStrategyType.VANILLA,
            },
          ],
          proposalPeriodStartUnixTimestamp: timestamp + ONE_DAY_SEC,
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

    timedFundingRound = TimedFundingRound__factory.connect(roundAddress, signer);

    // Send the pending L1 -> L2 message
    await starknet.devnet.flush();

    const block = await starknet.getBlock({
      blockNumber: 'latest',
    });
    [, l2RoundAddress] = block.transaction_receipts[0].events[1].data;

    timedFundingRoundContract = timedFundingRoundL2Factory.getContractAt(
      `0x${BigInt(l2RoundAddress).toString(16)}`,
    );

    await starknet.devnet.increaseTime(ONE_DAY_SEC + 1);
    await starknet.devnet.createBlock();
  });

  it('should create a proposal using an Ethereum transaction', async () => {
    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(l2RoundAddress, PROPOSE_SELECTOR, proposeCalldata),
    );

    // Check that the L1 -> L2 message has been propagated
    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    // Create the proposal
    const { transaction_hash } = await starknetAccount.execute({
      contractAddress: ethTxAuth.address,
      entrypoint: 'authenticate',
      calldata: stark.compileCalldata({
        target: l2RoundAddress,
        function_selector: PROPOSE_SELECTOR,
        calldata: proposeCalldata,
      }),
    });

    const { events } = await starknet.getTransactionReceipt(transaction_hash);
    const [proposalId, proposerAddress, metadataUriLength, ...actualMetadataUri] = events[0].data;

    expect(parseInt(proposalId, 16)).to.equal(1);
    expect(proposerAddress).to.equal(signer.address.toLowerCase());
    expect(parseInt(metadataUriLength, 16)).to.equal(3);

    const expectedMetdataUri = utils.intsSequence.IntsSequence.LEFromString(METADATA_URI);
    for (let i = 0; i < actualMetadataUri.length; i++) {
      expect(actualMetadataUri[i]).to.equal(expectedMetdataUri.values[i]);
    }
  });

  it('should not allow the same commit to be executed multiple times', async () => {
    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(l2RoundAddress, PROPOSE_SELECTOR, proposeCalldata),
    );

    await starknet.devnet.flush();
    await starknetAccount.execute({
      contractAddress: ethTxAuth.address,
      entrypoint: 'authenticate',
      calldata: stark.compileCalldata({
        target: l2RoundAddress,
        function_selector: PROPOSE_SELECTOR,
        calldata: proposeCalldata,
      }),
    });

    try {
      // Second attempt at calling authenticate should fail
      await starknetAccount.execute({
        contractAddress: ethTxAuth.address,
        entrypoint: 'authenticate',
        calldata: stark.compileCalldata({
          target: l2RoundAddress,
          function_selector: PROPOSE_SELECTOR,
          calldata: proposeCalldata,
        }),
      });
      expect(true).to.equal(false); // This line should never be reached
    } catch (error: any) {
      expect(error.message).to.contain('Hash not yet committed or already executed');
    }
  });

  it('should fail if the correct hash of the payload is not committed on L1 before execution is called', async () => {
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(l2RoundAddress, VOTE_SELECTOR, proposeCalldata),
    ); // Wrong selector

    await starknet.devnet.flush();
    try {
      await starknetAccount.execute({
        contractAddress: ethTxAuth.address,
        entrypoint: 'authenticate',
        calldata: stark.compileCalldata({
          target: l2RoundAddress,
          function_selector: PROPOSE_SELECTOR,
          calldata: proposeCalldata,
        }),
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
      utils.encoding.getCommit(l2RoundAddress, PROPOSE_SELECTOR, proposeCalldata),
    );

    await starknet.devnet.flush();
    try {
      await starknetAccount.execute({
        contractAddress: ethTxAuth.address,
        entrypoint: 'authenticate',
        calldata: stark.compileCalldata({
          target: l2RoundAddress,
          function_selector: PROPOSE_SELECTOR,
          calldata: proposeCalldata,
        }),
      });
      expect(true).to.equal(false); // This line should never be reached
    } catch (err: any) {
      expect(err.message).to.contain('Commit made by invalid L1 address');
    }
  });

  it('should cancel a proposal using an Ethereum transaction', async () => {
    const proposeCalldata = propHouse.round.timedFunding.getProposeCalldata({
      proposer: signer.address,
      metadataUri: 'Test cancel proposal!',
    });

    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(l2RoundAddress, PROPOSE_SELECTOR, proposeCalldata),
    );
    // Check that the L1 -> L2 message has been propagated
    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    const { transaction_hash } = await starknetAccount.execute({
      contractAddress: ethTxAuth.address,
      entrypoint: 'authenticate',
      calldata: stark.compileCalldata({
        target: l2RoundAddress,
        function_selector: PROPOSE_SELECTOR,
        calldata: proposeCalldata,
      }),
    });

    const { events } = await starknet.getTransactionReceipt(transaction_hash);
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
      utils.encoding.getCommit(l2RoundAddress, CANCEL_PROPOSAL_SELECTOR, cancelProposalCalldata),
    );

    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    await starknetAccount.execute({
      contractAddress: ethTxAuth.address,
      entrypoint: 'authenticate',
      calldata: stark.compileCalldata({
        target: l2RoundAddress,
        function_selector: CANCEL_PROPOSAL_SELECTOR,
        calldata: cancelProposalCalldata,
      }),
    });

    ({ is_cancelled } = await timedFundingRoundContract.call('get_proposal_info', {
      proposal_id: proposalId,
    }));
    expect(parseInt(is_cancelled, 16)).to.equal(1);
  });

  it('should create a vote using an Ethereum transaction', async () => {
    const voteCalldata = propHouse.round.timedFunding.getVoteCalldata({
      voter: signer.address,
      proposalVotes: [
        {
          proposalId: 1,
          votingPower: 1,
        },
      ],
      votingStrategyIds: [vanillaVotingStrategyId],
      votingStrategyParams: [[]],
    });

    // Commit the hash of the payload to the StarkNet commit L1 contract
    await starknetCommit.commit(
      ethTxAuth.address,
      utils.encoding.getCommit(l2RoundAddress, VOTE_SELECTOR, voteCalldata),
    );
    // Check that the L1 -> L2 message has been propagated
    expect((await starknet.devnet.flush()).consumed_messages.from_l1).to.have.a.lengthOf(1);

    await starknet.devnet.increaseTime(ONE_DAY_SEC);

    await starknet.devnet.createBlock();

    // Cast vote
    const { transaction_hash } = await starknetAccount.execute({
      contractAddress: ethTxAuth.address,
      entrypoint: 'authenticate',
      calldata: stark.compileCalldata({
        target: l2RoundAddress,
        function_selector: VOTE_SELECTOR,
        calldata: voteCalldata,
      }),
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

    const { transaction_hash } = await propHouse.round.timedFunding.finalizeRound(starknetAccount, {
      round: timedFundingRoundContract.address,
      awards: [{ assetId, amount }],
    });
    const { events } = await starknet.getTransactionReceipt(transaction_hash);
    const [merkleRootLow, merkleRootHigh, winnersLen, ...winners] = events[0].data;

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

    const finalizeTx = timedFundingRound.finalizeRound(merkleRootLow, merkleRootHigh);

    await expect(finalizeTx).to.emit(timedFundingRound, 'RoundFinalized');

    const leaf = generateClaimLeaf({
      proposalId: winner.proposalId,
      proposerAddress: signer.address,
      assetId: utils.encoding.getETHAssetID(),
      assetAmount: amount.toHex(),
    });
    const tree = generateClaimMerkleTree([leaf]);
    const proof = tree.getHexProof(leaf);
    const claimTx = timedFundingRound.claimAward(
      winner.proposalId,
      ONE_ETHER,
      {
        assetType: AssetType.ETH,
        amount: ONE_ETHER,
        token: constants.AddressZero,
        identifier: 0,
      },
      proof,
    );
    await expect(claimTx)
      .to.emit(timedFundingRound, 'AwardClaimed')
      .withArgs(winner.proposalId, signer.address, signer.address, assetId.toHex(), amount.toHex());
  });
});
