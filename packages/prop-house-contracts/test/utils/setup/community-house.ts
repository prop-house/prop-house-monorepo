import hre, { starknet } from 'hardhat';
import { Account, SequencerProvider } from 'starknet';
import { commonL1Setup } from './common';
import { CommunityHouse__factory, TimedFundingRound__factory } from '../../../typechain';
import { StarknetContractFactory } from 'starknet-hardhat-plugin-extended/dist/src/types';
import { getStarknetArtifactPaths } from '../utils';
import { constants } from 'ethers';
import { STARKNET_MAX_FEE } from '../constants';

export const communityHouseSetup = async () => {
  const config = await commonL1Setup();

  const [{ address, private_key }] = await starknet.devnet.getPredeployedAccounts();
  const starknetSigner = await starknet.OpenZeppelinAccount.getAccountFromAddress(
    address,
    private_key,
  );
  const starknetProvider = new SequencerProvider({
    baseUrl: 'http://127.0.0.1:5050',
  });
  const starknetAccount = new Account(starknetProvider, address, starknetSigner.keyPair);

  const roundFactoryMetadata = getStarknetArtifactPaths('RoundFactory');
  const roundDeployerFactory = new StarknetContractFactory({
    hre,
    abiPath: roundFactoryMetadata.sierra,
    metadataPath: roundFactoryMetadata.sierra,
    casmPath: roundFactoryMetadata.casm,
  });

  const ethExecutionStrategyMetadata = getStarknetArtifactPaths('EthereumExecutionStrategy');
  const ethExecutionStrategyFactory = new StarknetContractFactory({
    hre,
    abiPath: ethExecutionStrategyMetadata.sierra,
    metadataPath: ethExecutionStrategyMetadata.sierra,
    casmPath: ethExecutionStrategyMetadata.casm,
  });

  const votingStrategyRegistryMetadata = getStarknetArtifactPaths('VotingStrategyRegistry');
  const votingStrategyRegistryFactory = new StarknetContractFactory({
    hre,
    abiPath: votingStrategyRegistryMetadata.sierra,
    metadataPath: votingStrategyRegistryMetadata.sierra,
    casmPath: votingStrategyRegistryMetadata.casm,
  });

  await starknetSigner.declare(roundDeployerFactory, {
    maxFee: STARKNET_MAX_FEE,
  });
  await starknetSigner.declare(ethExecutionStrategyFactory, {
    maxFee: STARKNET_MAX_FEE,
  });
  await starknetSigner.declare(votingStrategyRegistryFactory, {
    maxFee: STARKNET_MAX_FEE,
  });

  const communityHouseFactory = new CommunityHouse__factory(config.deployer);

  const roundFactory = await starknetSigner.deploy(roundDeployerFactory, {
    origin_messenger: config.messenger.address,
  });
  const ethExecutionStrategy = await starknetSigner.deploy(ethExecutionStrategyFactory, {
    round_factory: roundFactory.address,
  });
  const votingStrategyRegistry = await starknetSigner.deploy(votingStrategyRegistryFactory);

  const communityHouseImpl = await communityHouseFactory.deploy(
    config.propHouse.address,
    constants.AddressZero,
    config.creatorPassIssuer.address,
  );

  await config.manager.registerHouse(communityHouseImpl.address);

  return {
    ...config,
    starknetSigner,
    starknetProvider,
    starknetAccount,
    communityHouseImpl,
    roundFactory,
    votingStrategyRegistry,
    ethExecutionStrategy,
  };
};

export const timedFundingRoundSetup = async () => {
  const config = await communityHouseSetup();

  const timedFundingRoundFactory = new TimedFundingRound__factory(config.deployer);

  const timedFundingRoundL2Metadata = getStarknetArtifactPaths('TimedFundingRound');
  const timedFundingRoundL2Factory = new StarknetContractFactory({
    hre,
    abiPath: timedFundingRoundL2Metadata.sierra,
    metadataPath: timedFundingRoundL2Metadata.sierra,
    casmPath: timedFundingRoundL2Metadata.casm,
  });

  const ethTxAuthStrategyMetadata = getStarknetArtifactPaths('EthereumTxAuthStrategy');
  const ethTxAuthStrategyFactory = new StarknetContractFactory({
    hre,
    abiPath: ethTxAuthStrategyMetadata.sierra,
    metadataPath: ethTxAuthStrategyMetadata.sierra,
    casmPath: ethTxAuthStrategyMetadata.casm,
  });

  const timedFundingRoundEthSigAuthStrategyMetadata =
    getStarknetArtifactPaths('EthereumSigAuthStrategy');
  const timedFundingRoundEthSigAuthStrategyFactory = new StarknetContractFactory({
    hre,
    abiPath: timedFundingRoundEthSigAuthStrategyMetadata.sierra,
    metadataPath: timedFundingRoundEthSigAuthStrategyMetadata.sierra,
    casmPath: timedFundingRoundEthSigAuthStrategyMetadata.casm,
  });

  await config.starknetSigner.declare(ethTxAuthStrategyFactory, {
    maxFee: STARKNET_MAX_FEE,
  });
  await config.starknetSigner.declare(timedFundingRoundEthSigAuthStrategyFactory, {
    maxFee: STARKNET_MAX_FEE,
  });

  const ethTxAuthStrategy = await config.starknetSigner.deploy(ethTxAuthStrategyFactory, {
    commit_address: config.starknetCommit.address,
  });
  // prettier-ignore
  const timedFundingRoundEthSigAuthStrategy = await config.starknetSigner.deploy(
    timedFundingRoundEthSigAuthStrategyFactory,
  );

  await config.starknetSigner.declare(timedFundingRoundL2Factory, {
    constants: {
      '0xdead0001': config.votingStrategyRegistry.address,
      '0xdead0002': config.ethExecutionStrategy.address,
      '0xdead0003': ethTxAuthStrategy.address,
      '0xdead0004': timedFundingRoundEthSigAuthStrategy.address,
    },
    maxFee: STARKNET_MAX_FEE,
  });
  const timedFundingRoundClassHash = await timedFundingRoundL2Factory.getClassHash();

  const timedFundingRoundImpl = await timedFundingRoundFactory.deploy(
    timedFundingRoundClassHash,
    config.propHouse.address,
    config.mockStarknetMessaging.address,
    config.messenger.address,
    constants.AddressZero,
    config.roundFactory.address,
    config.ethExecutionStrategy.address,
  );

  await config.manager.registerRound(
    config.communityHouseImpl.address,
    timedFundingRoundImpl.address,
  );

  return {
    ...config,
    timedFundingRoundImpl,
    timedFundingRoundL2Factory,
    timedFundingRoundClassHash,
    ethTxAuthStrategy,
    timedFundingRoundEthSigAuthStrategy,
  };
};
