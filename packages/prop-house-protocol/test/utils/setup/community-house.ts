import hre, { starknet } from 'hardhat';
import { Account, SequencerProvider } from 'starknet';
import { commonL1Setup } from './common';
import { CommunityHouse__factory, TimedRound__factory, InfiniteRound__factory } from '../../../typechain';
import { StarknetContractFactory } from 'starknet-hardhat-plugin-extended/dist/src/types';
import { asciiToHex, getStarknetArtifactPaths } from '../utils';
import { EIP_712_DOMAIN_SEPARATOR_GOERLI, STARKNET_MAX_FEE } from '../constants';
import { RoundType } from '@prophouse/sdk';
import { constants } from 'ethers';
import { ChainId } from '../../../src';

const DependencyKey = {
  EXECUTION_STRATEGY: asciiToHex('EXECUTION_STRATEGY'),
  AUTH_STRATEGIES: asciiToHex('AUTH_STRATEGIES'),
};

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

  const roundFactoryMetadata = getStarknetArtifactPaths('EthereumRoundFactory');
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

  const roundDependencyRegistryMetadata = getStarknetArtifactPaths('RoundDependencyRegistry');
  const roundDependencyRegistryFactory = new StarknetContractFactory({
    hre,
    abiPath: roundDependencyRegistryMetadata.sierra,
    metadataPath: roundDependencyRegistryMetadata.sierra,
    casmPath: roundDependencyRegistryMetadata.casm,
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
  await starknetSigner.declare(roundDependencyRegistryFactory, {
    maxFee: STARKNET_MAX_FEE,
  });

  const communityHouseFactory = new CommunityHouse__factory(config.deployer);

  const roundFactory = await starknetSigner.deploy(roundDeployerFactory, {
    origin_chain_id: ChainId.EthereumHardhat,
    origin_messenger: config.messenger.address,
  });
  const ethExecutionStrategy = await starknetSigner.deploy(ethExecutionStrategyFactory, {
    round_factory: roundFactory.address,
  });
  const strategyRegistry = await starknetSigner.deploy(strategyRegistryFactory);
  const roundDependencyRegistry = await starknetSigner.deploy(roundDependencyRegistryFactory, {
    initial_owner: address,
  });

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
    roundDependencyRegistry,
  };
};

export const infiniteRoundSetup = async () => {
  const config = await communityHouseSetup();

  const infiniteRoundFactory = new InfiniteRound__factory(config.deployer);

  const infiniteRoundL2Metadata = getStarknetArtifactPaths('InfiniteRound');
  const infiniteRoundL2Factory = new StarknetContractFactory({
    hre,
    abiPath: infiniteRoundL2Metadata.sierra,
    metadataPath: infiniteRoundL2Metadata.sierra,
    casmPath: infiniteRoundL2Metadata.casm,
  });

  const infiniteRoundEthTxAuthStrategyMetadata = getStarknetArtifactPaths('InfiniteRoundEthereumTxAuthStrategy');
  const infiniteRoundEthTxAuthStrategyFactory = new StarknetContractFactory({
    hre,
    abiPath: infiniteRoundEthTxAuthStrategyMetadata.sierra,
    metadataPath: infiniteRoundEthTxAuthStrategyMetadata.sierra,
    casmPath: infiniteRoundEthTxAuthStrategyMetadata.casm,
  });

  const infiniteRoundEthSigAuthStrategyMetadata = getStarknetArtifactPaths('InfiniteRoundEthereumSigAuthStrategy');
  const infiniteRoundEthSigAuthStrategyFactory = new StarknetContractFactory({
    hre,
    abiPath: infiniteRoundEthSigAuthStrategyMetadata.sierra,
    metadataPath: infiniteRoundEthSigAuthStrategyMetadata.sierra,
    casmPath: infiniteRoundEthSigAuthStrategyMetadata.casm,
  });

  await config.starknetSigner.declare(infiniteRoundEthTxAuthStrategyFactory, {
    maxFee: STARKNET_MAX_FEE,
  });
  await config.starknetSigner.declare(infiniteRoundEthSigAuthStrategyFactory, {
    maxFee: STARKNET_MAX_FEE,
  });

  const infiniteRoundEthTxAuthStrategy = await config.starknetSigner.deploy(infiniteRoundEthTxAuthStrategyFactory, {
    commit_address: config.starknetCommit.address,
  });
  // prettier-ignore
  const infiniteRoundEthSigAuthStrategy = await config.starknetSigner.deploy(
    infiniteRoundEthSigAuthStrategyFactory,
    {
      domain_separator: EIP_712_DOMAIN_SEPARATOR_GOERLI,
    },
  );

  // Add Ethereum auth strategies
  await config.starknetSigner.invoke(
    config.roundDependencyRegistry,
    'update_dependencies_if_not_locked',
    {
      origin_chain_id: ChainId.EthereumHardhat,
      round_type: asciiToHex(RoundType.INFINITE),
      key: DependencyKey.AUTH_STRATEGIES,
      dependencies: [infiniteRoundEthTxAuthStrategy.address, infiniteRoundEthSigAuthStrategy.address],
    },
  );

  // Add Ethereum execution strategy
  await config.starknetSigner.invoke(
    config.roundDependencyRegistry,
    'update_dependency_if_not_locked',
    {
      origin_chain_id: ChainId.EthereumHardhat,
      round_type: asciiToHex(RoundType.INFINITE),
      key: DependencyKey.EXECUTION_STRATEGY,
      dependency: config.ethExecutionStrategy.address,
    },
  );

  for (const key of Object.values(DependencyKey)) {
    await config.starknetSigner.invoke(
      config.roundDependencyRegistry,
      'lock_key',
      {
        origin_chain_id: ChainId.EthereumHardhat,
        round_type: asciiToHex(RoundType.INFINITE),
        key,
      },
    );
  }

  // Write auth and execution strategies to the round dependency registry
  const STRATEGY_REGISTRY_ADDRESS_KEY = asciiToHex('STRATEGY_REGISTRY_ADDRESS');
  const ROUND_DEP_REGISTRY_ADDRESS_KEY = asciiToHex('ROUND_DEP_REGISTRY_ADDRESS');
  await config.starknetSigner.declare(infiniteRoundL2Factory, {
    constants: {
      [STRATEGY_REGISTRY_ADDRESS_KEY]: config.strategyRegistry.address,
      [ROUND_DEP_REGISTRY_ADDRESS_KEY]: config.roundDependencyRegistry.address,
    },
    maxFee: STARKNET_MAX_FEE,
  });
  const infiniteRoundClassHash = await infiniteRoundL2Factory.getClassHash();

  const infiniteRoundImpl = await infiniteRoundFactory.deploy(
    infiniteRoundClassHash,
    config.propHouse.address,
    config.mockStarknetMessaging.address,
    config.messenger.address,
    config.roundFactory.address,
    config.ethExecutionStrategy.address,
    constants.AddressZero,
  );

  await config.manager.registerRound(config.communityHouseImpl.address, infiniteRoundImpl.address);
  return {
    ...config,
    infiniteRoundImpl,
    infiniteRoundL2Factory,
    infiniteRoundClassHash,
    infiniteRoundEthTxAuthStrategy,
    infiniteRoundEthSigAuthStrategy,
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

  const timedRoundEthTxAuthStrategyMetadata = getStarknetArtifactPaths('TimedRoundEthereumTxAuthStrategy');
  const timedRoundEthTxAuthStrategyFactory = new StarknetContractFactory({
    hre,
    abiPath: timedRoundEthTxAuthStrategyMetadata.sierra,
    metadataPath: timedRoundEthTxAuthStrategyMetadata.sierra,
    casmPath: timedRoundEthTxAuthStrategyMetadata.casm,
  });

  const timedRoundEthSigAuthStrategyMetadata = getStarknetArtifactPaths('TimedRoundEthereumSigAuthStrategy');
  const timedRoundEthSigAuthStrategyFactory = new StarknetContractFactory({
    hre,
    abiPath: timedRoundEthSigAuthStrategyMetadata.sierra,
    metadataPath: timedRoundEthSigAuthStrategyMetadata.sierra,
    casmPath: timedRoundEthSigAuthStrategyMetadata.casm,
  });

  await config.starknetSigner.declare(timedRoundEthTxAuthStrategyFactory, {
    maxFee: STARKNET_MAX_FEE,
  });
  await config.starknetSigner.declare(timedRoundEthSigAuthStrategyFactory, {
    maxFee: STARKNET_MAX_FEE,
  });

  const timedRoundEthTxAuthStrategy = await config.starknetSigner.deploy(timedRoundEthTxAuthStrategyFactory, {
    commit_address: config.starknetCommit.address,
  });
  // prettier-ignore
  const timedRoundEthSigAuthStrategy = await config.starknetSigner.deploy(
    timedRoundEthSigAuthStrategyFactory,
    {
      domain_separator: EIP_712_DOMAIN_SEPARATOR_GOERLI,
    },
  );

  // Add Ethereum auth strategies
  await config.starknetSigner.invoke(
    config.roundDependencyRegistry,
    'update_dependencies_if_not_locked',
    {
      origin_chain_id: ChainId.EthereumHardhat,
      round_type: asciiToHex(RoundType.TIMED),
      key: DependencyKey.AUTH_STRATEGIES,
      dependencies: [timedRoundEthTxAuthStrategy.address, timedRoundEthSigAuthStrategy.address],
    },
  );

  // Add Ethereum execution strategy
  await config.starknetSigner.invoke(
    config.roundDependencyRegistry,
    'update_dependency_if_not_locked',
    {
      origin_chain_id: ChainId.EthereumHardhat,
      round_type: asciiToHex(RoundType.TIMED),
      key: DependencyKey.EXECUTION_STRATEGY,
      dependency: config.ethExecutionStrategy.address,
    },
  );

  for (const key of Object.values(DependencyKey)) {
    await config.starknetSigner.invoke(
      config.roundDependencyRegistry,
      'lock_key',
      {
        origin_chain_id: ChainId.EthereumHardhat,
        round_type: asciiToHex(RoundType.TIMED),
        key,
      },
    );
  }

  // Write auth and execution strategies to the round dependency registry
  const STRATEGY_REGISTRY_ADDRESS_KEY = asciiToHex('STRATEGY_REGISTRY_ADDRESS');
  const ROUND_DEP_REGISTRY_ADDRESS_KEY = asciiToHex('ROUND_DEP_REGISTRY_ADDRESS');
  await config.starknetSigner.declare(timedRoundL2Factory, {
    constants: {
      [STRATEGY_REGISTRY_ADDRESS_KEY]: config.strategyRegistry.address,
      [ROUND_DEP_REGISTRY_ADDRESS_KEY]: config.roundDependencyRegistry.address,
    },
    maxFee: STARKNET_MAX_FEE,
  });
  const timedRoundClassHash = await timedRoundL2Factory.getClassHash();

  const timedRoundImpl = await timedRoundFactory.deploy(
    timedRoundClassHash,
    config.propHouse.address,
    config.mockStarknetMessaging.address,
    config.messenger.address,
    config.roundFactory.address,
    config.ethExecutionStrategy.address,
    constants.AddressZero,
  );

  await config.manager.registerRound(config.communityHouseImpl.address, timedRoundImpl.address);
  return {
    ...config,
    timedRoundImpl,
    timedRoundL2Factory,
    timedRoundClassHash,
    timedRoundEthTxAuthStrategy,
    timedRoundEthSigAuthStrategy,
  };
};
