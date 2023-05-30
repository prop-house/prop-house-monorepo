import hre, { starknet } from 'hardhat';
import { Account, SequencerProvider } from 'starknet';
import { commonL1Setup } from './common';
import { CommunityHouse__factory, TimedRound__factory } from '../../../typechain';
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

  const strategyRegistryMetadata = getStarknetArtifactPaths('StrategyRegistry');
  const strategyRegistryFactory = new StarknetContractFactory({
    hre,
    abiPath: strategyRegistryMetadata.sierra,
    metadataPath: strategyRegistryMetadata.sierra,
    casmPath: strategyRegistryMetadata.casm,
  });

  await starknetSigner.declare(roundDeployerFactory, {
    maxFee: STARKNET_MAX_FEE,
  });
  await starknetSigner.declare(ethExecutionStrategyFactory, {
    maxFee: STARKNET_MAX_FEE,
  });
  await starknetSigner.declare(strategyRegistryFactory, {
    maxFee: STARKNET_MAX_FEE,
  });

  const communityHouseFactory = new CommunityHouse__factory(config.deployer);

  const roundFactory = await starknetSigner.deploy(roundDeployerFactory, {
    origin_messenger: config.messenger.address,
  });
  const ethExecutionStrategy = await starknetSigner.deploy(ethExecutionStrategyFactory, {
    round_factory: roundFactory.address,
  });
  const strategyRegistry = await starknetSigner.deploy(strategyRegistryFactory);

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
    strategyRegistry,
    ethExecutionStrategy,
  };
};

export const timedRoundSetup = async () => {
  const config = await communityHouseSetup();

  const timedRoundFactory = new TimedRound__factory(config.deployer);

  const timedRoundL2Metadata = getStarknetArtifactPaths('TimedRound');
  const timedRoundL2Factory = new StarknetContractFactory({
    hre,
    abiPath: timedRoundL2Metadata.sierra,
    metadataPath: timedRoundL2Metadata.sierra,
    casmPath: timedRoundL2Metadata.casm,
  });

  const ethTxAuthStrategyMetadata = getStarknetArtifactPaths('EthereumTxAuthStrategy');
  const ethTxAuthStrategyFactory = new StarknetContractFactory({
    hre,
    abiPath: ethTxAuthStrategyMetadata.sierra,
    metadataPath: ethTxAuthStrategyMetadata.sierra,
    casmPath: ethTxAuthStrategyMetadata.casm,
  });

  const timedRoundEthSigAuthStrategyMetadata = getStarknetArtifactPaths('EthereumSigAuthStrategy');
  const timedRoundEthSigAuthStrategyFactory = new StarknetContractFactory({
    hre,
    abiPath: timedRoundEthSigAuthStrategyMetadata.sierra,
    metadataPath: timedRoundEthSigAuthStrategyMetadata.sierra,
    casmPath: timedRoundEthSigAuthStrategyMetadata.casm,
  });

  await config.starknetSigner.declare(ethTxAuthStrategyFactory, {
    maxFee: STARKNET_MAX_FEE,
  });
  await config.starknetSigner.declare(timedRoundEthSigAuthStrategyFactory, {
    maxFee: STARKNET_MAX_FEE,
  });

  const ethTxAuthStrategy = await config.starknetSigner.deploy(ethTxAuthStrategyFactory, {
    commit_address: config.starknetCommit.address,
  });
  // prettier-ignore
  const timedRoundEthSigAuthStrategy = await config.starknetSigner.deploy(
    timedRoundEthSigAuthStrategyFactory,
  );

  await config.starknetSigner.declare(timedRoundL2Factory, {
    constants: {
      '0xdead0001': config.strategyRegistry.address,
      '0xdead0002': config.ethExecutionStrategy.address,
      '0xdead0003': ethTxAuthStrategy.address,
      '0xdead0004': timedRoundEthSigAuthStrategy.address,
    },
    maxFee: STARKNET_MAX_FEE,
  });
  const timedRoundClassHash = await timedRoundL2Factory.getClassHash();

  const timedRoundImpl = await timedRoundFactory.deploy(
    timedRoundClassHash,
    config.propHouse.address,
    config.mockStarknetMessaging.address,
    config.messenger.address,
    constants.AddressZero,
    config.roundFactory.address,
    config.ethExecutionStrategy.address,
  );

  await config.manager.registerRound(config.communityHouseImpl.address, timedRoundImpl.address);

  return {
    ...config,
    timedRoundImpl,
    timedRoundL2Factory,
    timedRoundClassHash,
    ethTxAuthStrategy,
    timedRoundEthSigAuthStrategy,
  };
};
