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
  STARKNET_MAX_FEE,
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
import { MockStarknetMessaging } from '../../../typechain';
import { starknet, ethers, network } from 'hardhat';
import { poseidonHashMany } from 'micro-starknet';
import { StarknetContract } from 'hardhat/types';
import { solidity } from 'ethereum-waffle';
import { BigNumber, constants } from 'ethers';
import { Account, uint256 } from 'starknet';
import chai, { expect } from 'chai';

chai.use(solidity);

describe('TimedRoundStrategy - ETH Signature Auth Strategy', () => {
  const networkUrl = network.config.url!;

  let signer: SignerWithAddress;
  let starknetAccount: Account;

  let propHouse: PropHouse;
  let timedRound: TimedRoundContract;
  let mockStarknetMessaging: MockStarknetMessaging;

  let timedRoundContract: StarknetContract;
  let ethSigAuth: StarknetContract;

  let timedRoundL2Factory: StarknetContractFactory;

  let l2RoundAddress: string;

  before(async () => {
    await starknet.devnet.restart();

    const { block_timestamp } = await starknet.devnet.setTime(Math.floor(Date.now() / 1000));

    [signer] = await ethers.getSigners();

    const config = await timedRoundSetup();
    ({
      timedRoundEthSigAuthStrategy: ethSigAuth,
      timedRoundL2Factory,
      mockStarknetMessaging,
      starknetAccount,
    } = config);

    const vanillaGovPowerStrategyFactory = await starknet.getContractFactory(
      'prop_house_VanillaGovernancePowerStrategy',
    );

    await config.starknetSigner.declare(vanillaGovPowerStrategyFactory, {
      maxFee: STARKNET_MAX_FEE,
    });

    const vanillaGovPowerStrategy = await config.starknetSigner.deploy(
      vanillaGovPowerStrategyFactory,
    );

    // Stub subgraph functions
    const funcs = ['getRoundVotingStrategies', 'getGovPowerStrategies'] as const;
    for (const func of funcs) {
      gql.QueryWrapper.prototype[func] = () =>
        Promise.resolve({
          govPowerStrategies: [
            {
              id: `0x${poseidonHashMany([BigInt(vanillaGovPowerStrategy.address)]).toString(16)}`,
              type: GQLGovPowerStrategyType.Vanilla,
              address: vanillaGovPowerStrategy.address,
              params: [],
            },
          ],
        });
    }

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
            infinite: constants.AddressZero,
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
            infinite: {
              sig: constants.HashZero,
              tx: constants.HashZero,
            },
            timed: {
              sig: config.timedRoundEthSigAuthStrategy.address,
              tx: config.timedRoundEthTxAuthStrategy.address,
            },
          },
          herodotus: {
            factRegistry: '',
            l1HeadersStore: '',
          },
          classHashes: {
            infinite: constants.HashZero,
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

  it('should create a proposal using an Ethereum signature', async () => {
    const {
      address,
      signature,
      message: data,
    } = await propHouse.round.timed.signProposeMessage({
      round: timedRoundContract.address,
      metadataUri: METADATA_URI,
    });
    const { transaction_hash } = await propHouse.round.timed.relaySignedProposePayload(
      starknetAccount,
      {
        address,
        signature,
        data,
      },
    );

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

  it.skip('should not authenticate an invalid signature', async () => {
    const { signature, message: data } = await propHouse.round.timed.signProposeMessage({
      round: timedRoundContract.address,
      metadataUri: METADATA_URI,
    });
    const [, signer2] = await ethers.getSigners();

    try {
      // Data is signed with accounts[0], but the proposer is accounts[1] so it should fail
      await propHouse.round.timed.relaySignedProposePayload(starknetAccount, {
        address: signer2.address,
        signature,
        data,
      });
      expect(true).to.equal(false); // This line should never be reached
    } catch (error: any) {
      expect(error.message).to.contain('Invalid signature.');
    }
  });

  it('should create a vote using an Ethereum signature', async () => {
    await starknet.devnet.increaseTime(ONE_DAY_SEC);
    await starknet.devnet.createBlock();

    const {
      address,
      signature,
      message: data,
    } = await propHouse.round.timed.signVoteMessage({
      round: timedRoundContract.address,
      votes: [
        {
          proposalId: 1,
          votingPower: 1,
        },
      ],
    });
    const { transaction_hash } = await propHouse.round.timed.relaySignedVotePayload(
      starknetAccount,
      {
        address,
        signature,
        data,
      },
    );

    const { events } = await starknet.getTransactionReceipt(transaction_hash);
    const [proposalId, voterAddress, votingPower] = events[0].data;

    expect(parseInt(proposalId, 16)).to.equal(1);
    expect(voterAddress).to.equal(signer.address.toLowerCase());
    expect(parseInt(votingPower, 16)).to.equal(1);
  });

  it('should finalize a round and allow a winner to claim their award', async () => {
    await starknet.devnet.increaseTime(ONE_DAY_SEC);
    await starknet.devnet.createBlock();

    const assetId = utils.encoding.getETHAssetID();
    const amount = ONE_ETHER.toHexString();
    const { transaction_hash } = await propHouse.round.timed.finalizeRound(starknetAccount, {
      round: timedRoundContract.address,
      awards: [
        {
          assetId: utils.encoding.getETHAssetID(),
          amount: ONE_ETHER,
        },
      ],
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

    const [proposer] = (
      await timedRoundContract.call(
        'get_proposal',
        { proposal_id: winningProposalIds[0] },
        { rawOutput: true },
      )
    ).response.split(' ');

    const winner = {
      position: 1,
      proposalId: winningProposalIds[0],
      proposer: BigNumber.from(proposer).toHexString(),
    };

    const { consumed_messages } = await starknet.devnet.flush();

    expect(consumed_messages.from_l2.length).to.equal(1);

    const finalizeTx = timedRound.finalize(merkleRootLow, merkleRootHigh);

    await expect(finalizeTx).to.emit(timedRound, 'RoundFinalized');

    const leaf = generateClaimLeaf({
      proposalId: winner.proposalId,
      position: winner.position,
      proposer: signer.address,
      assetId: utils.encoding.getETHAssetID(),
      assetAmount: amount,
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
      .withArgs(winner.proposalId, signer.address, signer.address, [assetId, amount]);
  });
});
