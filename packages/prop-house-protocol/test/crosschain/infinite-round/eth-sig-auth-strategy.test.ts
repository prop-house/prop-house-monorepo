import { StarknetContractFactory } from 'starknet-hardhat-plugin-extended/dist/src/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
  infiniteRoundSetup,
  CONTRACT_URI,
  METADATA_URI,
  ONE_DAY_SEC,
  ONE_ETHER,
  getStarknetArtifactPaths,
  STARKNET_MAX_FEE,
  generateIncrementalClaimLeaf,
  generateIncrementalClaimMerkleTree,
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
  InfiniteRoundContract,
  InfiniteRound__factory,
  Infinite,
  splitUint256,
  encoding,
} from '@prophouse/sdk';
import * as gql from '@prophouse/sdk/dist/gql';
import * as addresses from '@prophouse/protocol/dist/src/addresses';
import { GovPowerStrategyType as GQLGovPowerStrategyType } from '@prophouse/sdk/dist/gql/evm/graphql';
import { BigNumber, BigNumberish, constants } from 'ethers';
import { MockStarknetMessaging } from '../../../typechain';
import hre, { starknet, ethers, network } from 'hardhat';
import { poseidonHashMany } from 'micro-starknet';
import { StarknetContract } from 'hardhat/types';
import { solidity } from 'ethereum-waffle';
import { Account } from 'starknet';
import chai, { expect } from 'chai';

chai.use(solidity);

const maskTo250Bits = (value: BigNumberish) => {
  return BigNumber.from(value).and(ethers.BigNumber.from(2).pow(250).sub(1));
};

describe('InfiniteRoundStrategy - ETH Signature Auth Strategy', () => {
  const networkUrl = network.config.url!;

  let signer: SignerWithAddress;
  let starknetAccount: Account;

  let propHouse: PropHouse;
  let infiniteRound: InfiniteRoundContract;
  let mockStarknetMessaging: MockStarknetMessaging;

  let infiniteRoundContract: StarknetContract;
  let ethSigAuth: StarknetContract;

  let infiniteRoundL2Factory: StarknetContractFactory;

  let l2RoundAddress: string;

  const asset: Asset = {
    assetType: AssetType.ETH,
    amount: ONE_ETHER,
  };

  before(async () => {
    await starknet.devnet.restart();

    const { block_timestamp } = await starknet.devnet.setTime(Math.floor(Date.now() / 1000));

    [signer] = await ethers.getSigners();

    const config = await infiniteRoundSetup();
    ({
      infiniteRoundEthSigAuthStrategy: ethSigAuth,
      infiniteRoundL2Factory,
      mockStarknetMessaging,
      starknetAccount,
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
            infinite: config.infiniteRoundImpl.address,
            timed: constants.AddressZero,
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
              sig: config.infiniteRoundEthSigAuthStrategy.address,
              tx: config.infiniteRoundEthTxAuthStrategy.address,
            },
            timed: {
              sig: constants.HashZero,
              tx: constants.HashZero,
            },
          },
          herodotus: {
            factRegistry: '',
            l1HeadersStore: '',
          },
          classHashes: {
            infinite: config.infiniteRoundClassHash,
            timed: constants.HashZero,
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

    const creationResponse = await propHouse.createAndFundRoundOnNewHouse(
      {
        houseType: HouseType.COMMUNITY,
        config: {
          contractURI: CONTRACT_URI,
        },
      },
      {
        roundType: RoundType.INFINITE,
        title: 'Test Round',
        description: 'A round used for testing purposes',
        config: {
          votingStrategies: [
            {
              strategyType: VotingStrategyType.VANILLA,
            },
          ],
          startUnixTimestamp: block_timestamp,
          votePeriodDurationSecs: ONE_DAY_SEC * 2,
          quorumFor: 1,
          quorumAgainst: 1,
        },
      },
      [asset],
    );

    const creationReceipt = await creationResponse.wait();
    const [, , roundAddress] = creationReceipt.events!.find(
      ({ event }) => event === 'RoundCreated',
    )!.args!;

    await starknet.devnet.flush();

    infiniteRound = InfiniteRound__factory.connect(roundAddress, signer);

    // Send the pending L1 -> L2 message
    await starknet.devnet.flush();

    const block = await starknet.getBlock({
      blockNumber: 'latest',
    });
    [, l2RoundAddress] = block.transaction_receipts[0].events[1].data;

    infiniteRoundContract = infiniteRoundL2Factory.getContractAt(
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
    } = await propHouse.round.infinite.signProposeMessage({
      round: infiniteRoundContract.address,
      metadataUri: METADATA_URI,
      requestedAssets: [asset],
    });
    const { transaction_hash } = await propHouse.round.infinite.relaySignedProposePayload(
      starknetAccount,
      {
        address,
        signature,
        data,
      },
    );

    const { events } = await starknet.getTransactionReceipt(transaction_hash);
    const [proposalId, proposerAddress, metadataUriLength, ...remainingData] = events[0].data;
    const actualMetadataUri = remainingData.slice(0, parseInt(metadataUriLength, 16));
    const requestedAssetLength = remainingData[parseInt(metadataUriLength, 16)];
    const actualRequestedAssets = remainingData.slice(parseInt(metadataUriLength, 16) + 1);

    expect(parseInt(proposalId, 16)).to.equal(1);
    expect(proposerAddress).to.equal(signer.address.toLowerCase());
    expect(parseInt(metadataUriLength, 16)).to.equal(3);
    expect(parseInt(requestedAssetLength, 16)).to.equal(1);
    expect(actualRequestedAssets).to.deep.equal(
      encoding
        .compressAssets([asset])
        .map(asset => {
          const id = splitUint256.SplitUint256.fromUint(BigNumber.from(asset[0]).toBigInt());
          const amount = splitUint256.SplitUint256.fromUint(BigNumber.from(asset[1]).toBigInt());
          return [id.low, id.high, amount.low, amount.high];
        })
        .flat(),
    );

    const expectedMetadataUri = utils.intsSequence.IntsSequence.LEFromString(METADATA_URI);
    for (let i = 0; i < actualMetadataUri.length; i++) {
      expect(actualMetadataUri[i]).to.equal(expectedMetadataUri.values[i]);
    }
  });

  it.skip('should not authenticate an invalid signature', async () => {
    const { signature, message: data } = await propHouse.round.infinite.signProposeMessage({
      round: infiniteRoundContract.address,
      metadataUri: METADATA_URI,
      requestedAssets: [asset],
    });
    const [, signer2] = await ethers.getSigners();

    try {
      // Data is signed with accounts[0], but the proposer is accounts[1] so it should fail
      await propHouse.round.infinite.relaySignedProposePayload(starknetAccount, {
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
    } = await propHouse.round.infinite.signVoteMessage({
      round: infiniteRoundContract.address,
      votes: [
        {
          proposalId: 1,
          proposalVersion: 1,
          votingPower: 1,
          direction: Infinite.Direction.FOR,
        },
      ],
    });
    const { transaction_hash } = await propHouse.round.infinite.relaySignedVotePayload(
      starknetAccount,
      {
        address,
        signature,
        data,
      },
    );

    const { events } = await starknet.getTransactionReceipt(transaction_hash);
    const [proposalId, voterAddress, votingPowerLow, votingPowerHigh, direction] = events[1].data;

    expect(parseInt(proposalId, 16)).to.equal(1);
    expect(voterAddress).to.equal(signer.address.toLowerCase());
    expect(parseInt(votingPowerLow, 16)).to.equal(1);
    expect(parseInt(votingPowerHigh, 16)).to.equal(0);
    expect(parseInt(direction, 16)).to.equal(Infinite.Direction.FOR);
  });

  it('should allow a winner to claim their award', async () => {
    const { transaction_hash } = await starknetAccount.execute({
      contractAddress: infiniteRoundContract.address,
      entrypoint: 'process_winners',
      calldata: [],
    });
    const { events } = await starknet.getTransactionReceipt(transaction_hash);

    const [winnerCount, merkleRootLow, merkleRootHigh] = events[0].data;
    const merkleRoot = splitUint256.SplitUint256.fromObj({
      low: merkleRootLow,
      high: merkleRootHigh,
    });

    expect(parseInt(winnerCount, 16)).to.equal(1);
    expect(merkleRoot.toUint()).to.not.equal(0n);

    expect((await starknet.devnet.flush()).consumed_messages.from_l2).to.have.a.lengthOf(1);

    const updateWinnersTx = infiniteRound.updateWinners(winnerCount, merkleRootLow, merkleRootHigh);
    await expect(updateWinnersTx).to.emit(infiniteRound, 'WinnersUpdated').withArgs(winnerCount);

    const proposalId = 1;
    const requestedAssetsHash = maskTo250Bits(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['tuple(bytes32,uint256)[]'],
          [[[utils.encoding.getETHAssetID(), ONE_ETHER]]],
        ),
      ),
    );
    const leaf = generateIncrementalClaimLeaf({
      proposalId,
      proposer: signer.address,
      requestedAssetsHash: requestedAssetsHash.toHexString(),
    });

    const tree = generateIncrementalClaimMerkleTree([leaf]);
    const proof = tree.getProof(0);
    const claimTx = await infiniteRound.claim(
      proposalId,
      [
        {
          assetType: AssetType.ETH,
          amount: ONE_ETHER,
          token: constants.AddressZero,
          identifier: 0,
        },
      ],
      {
        pathIndices: proof.pathIndices,
        siblings: proof.siblings.flat().map((s: BigNumberish) => encoding.hexPadLeft(
          BigNumber.from(s).toHexString(),
        )),
      },
    );
    await expect(claimTx).to.emit(infiniteRound, 'AssetsClaimed');
  });

  it('should finalize a round and allow the winner to claim their award', async () => {
    const startFinalizationTx = infiniteRound.startFinalization({
      value: STARKNET_MAX_FEE,
    });
    await expect(startFinalizationTx).to.emit(infiniteRound, 'RoundFinalizationStarted');

    // Process L1 -> L2 message (finalize_round)
    await starknet.devnet.flush();

    // Process L2 -> L1 message (completeFinalization)
    await starknet.devnet.flush();

    const completeFinalizationTx = infiniteRound.completeFinalization(1);
    await expect(completeFinalizationTx).to.emit(infiniteRound, 'RoundFinalized');
  });
});
