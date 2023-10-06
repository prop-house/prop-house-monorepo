import {
  Manager__factory,
  Messenger__factory,
  CreatorPassIssuer__factory,
  PropHouse__factory,
  StarkNetCommit__factory,
  CommunityHouse__factory,
  InfiniteRound__factory,
  TimedRound__factory,
} from '../typechain';
import { task, types } from 'hardhat/config';
import { NonceManager } from '@ethersproject/experimental';
import { Starknet } from 'starknet-hardhat-plugin-extended/dist/src/types/starknet';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { RoundType, utils } from '@prophouse/sdk';
import { constants } from 'ethers';

enum ChainId {
  Mainnet = 1,
  Goerli = 5,
}

interface NetworkConfig {
  starknet: {
    core: string;
  };
  herodotus?: {
    factRegistry: string;
    l1HeadersStore: string;
  };
}

const DOMAIN_SEPARATORS: Record<number, BigInt | undefined> = {
  [ChainId.Mainnet]: undefined,
  [ChainId.Goerli]: BigInt('0x367959fbff4da0a038f30383de089bcd293b7960f35bd1db59a620d4c2cbfd81'),
};

const STRATEGY_REGISTRY_ADDRESS_KEY = utils.encoding.asciiToHex('STRATEGY_REGISTRY_ADDRESS');
const ROUND_DEP_REGISTRY_ADDRESS_KEY = utils.encoding.asciiToHex('ROUND_DEP_REGISTRY_ADDRESS');

const DEPENDENCY_KEY = {
  EXECUTION_STRATEGY: utils.encoding.asciiToHex('EXECUTION_STRATEGY'),
  AUTH_STRATEGIES: utils.encoding.asciiToHex('AUTH_STRATEGIES'),
};

const networkConfig: Record<number, NetworkConfig> = {
  [ChainId.Mainnet]: {
    starknet: {
      core: '0xc662c410C0ECf747543f5bA90660f6ABeBD9C8c4',
    },
  },
  [ChainId.Goerli]: {
    starknet: {
      core: '0xde29d060D45901Fb19ED6C6e959EB22d8626708e',
    },
    herodotus: {
      factRegistry: '0x5e6c5b45485f2eb7609a27e413aad727536b3590a64e18ceb5950e30852288f',
      l1HeadersStore: '0x1d9b36a00d7d5300e5da456c56d09c46dfefbc91b3a6b1552b6f2a34d6e34c4',
    },
  },
};

const MAX_FEE = BigInt(3e15);

const sleep = (ms = 1_000) => new Promise(resolve => setTimeout(resolve, ms));

const getStarknetAccount = async (starknet: Starknet) => {
  const { env } = process;
  const config = {
    oz: {
      address: env.STARKNET_OZ_ACCOUNT_ADDRESS?.toLowerCase(),
      privateKey: env.STARKNET_OZ_ACCOUNT_PRIVATE_KEY,
    },
    argent: {
      address: env.STARKNET_ARGENT_ACCOUNT_ADDRESS?.toLowerCase(),
      privateKey: env.STARKNET_ARGENT_ACCOUNT_PRIVATE_KEY,
    },
  };
  if (config.oz.address) {
    return starknet.OpenZeppelinAccount.getAccountFromAddress(
      config.oz.address,
      config.oz.privateKey!,
    );
  }
  return starknet.ArgentAccount.getAccountFromAddress(
    config.argent.address!,
    config.argent.privateKey!,
  );
};

task('deploy', 'Deploys all Prop House protocol L1 & L2 contracts')
  .addOptionalParam('manager', 'The manager address', undefined, types.string)
  .addOptionalParam('starknetCore', 'The Starknet core contract address', undefined, types.string)
  .addOptionalParam(
    'herodotusFactRegistry',
    'The Herodotus fact registry contract address',
    undefined,
    types.string,
  )
  .addOptionalParam(
    'herodotusL1HeadersStore',
    'The Herodotus L1 headers store contract address',
    undefined,
    types.string,
  )
  .setAction(async (args, hre) => {
    const { ethers, starknet } = hre;

    const ethNetwork = await ethers.provider.getNetwork();
    const config = networkConfig[ethNetwork.chainId];

    const [ethSigner] = await ethers.getSigners();
    const ethDeployer = new NonceManager(ethSigner as any);
    const starknetDeployer = await getStarknetAccount(starknet);

    if (!args.manager) {
      args.manager = await ethDeployer.getAddress();
    }
    if (!args.starknetCore) {
      if (!config.starknet?.core) {
        throw new Error(
          `Can not auto-detect StarknetCore contract on chain ${ethNetwork.name}. Provide it with the --starknet-core arg.`,
        );
      }
      args.starknetCore = config.starknet.core;
    }
    if (!args.herodotusFactRegistry) {
      if (!config.herodotus?.factRegistry) {
        throw new Error(
          `Can not auto-detect Herodotus fact registry contract on chain ${ethNetwork.name}. Provide it with the --herodotus-fact-registry arg.`,
        );
      }
      args.herodotusFactRegistry = config.herodotus.factRegistry;
    }
    if (!args.herodotusL1HeadersStore) {
      if (!config.herodotus?.l1HeadersStore) {
        throw new Error(
          `Can not auto-detect Herodotus L1 headers store contract on chain ${ethNetwork.name}. Provide it with the --herodotus-l1-headers-store arg.`,
        );
      }
      args.herodotusL1HeadersStore = config.herodotus.l1HeadersStore;
    }

    // L1 factories
    const managerFactory = new Manager__factory(ethDeployer);
    const propHouseFactory = new PropHouse__factory(ethDeployer);
    const messengerFactory = new Messenger__factory(ethDeployer);
    const creatorPassIssuerFactory = new CreatorPassIssuer__factory(ethDeployer);
    const starknetCommitFactory = new StarkNetCommit__factory(ethDeployer);
    const communityHouseImplFactory = new CommunityHouse__factory(ethDeployer);
    const infiniteRoundImplFactory = new InfiniteRound__factory(ethDeployer);
    const timedRoundImplFactory = new TimedRound__factory(ethDeployer);

    // Common L2 factories
    const roundDeployerFactory = await starknet.getContractFactory(
      'prop_house_EthereumRoundFactory',
    );
    const ethExecutionStrategyFactory = await starknet.getContractFactory(
      'prop_house_EthereumExecutionStrategy',
    );
    const strategyRegistryFactory = await starknet.getContractFactory(
      'prop_house_StrategyRegistry',
    );
    const roundDependencyRegistryFactory = await starknet.getContractFactory(
      'prop_house_RoundDependencyRegistry',
    );
    const ethBlockRegistryFactory = await starknet.getContractFactory(
      'prop_house_EthereumBlockRegistry',
    );

    // Gov power strategies
    const vanillaGovPowerStrategyFactory = await starknet.getContractFactory(
      'prop_house_VanillaGovernancePowerStrategy',
    );
    const allowlistGovPowerStrategyFactory = await starknet.getContractFactory(
      'prop_house_AllowlistGovernancePowerStrategy',
    );
    const ethBalanceOfGovPowerStrategyFactory = await starknet.getContractFactory(
      'prop_house_EthereumBalanceOfGovernancePowerStrategy',
    );

    // Infinite round factories
    const infiniteRoundL2Factory = await starknet.getContractFactory(
      'prop_house_InfiniteRound',
    );
    const infiniteRoundEthTxAuthStrategyFactory = await starknet.getContractFactory(
      'prop_house_InfiniteRoundEthereumTxAuthStrategy',
    );
    const infiniteRoundEthSigAuthStrategyFactory = await starknet.getContractFactory(
      'prop_house_InfiniteRoundEthereumSigAuthStrategy',
    );

    // Timed round factories
    const timedRoundL2Factory = await starknet.getContractFactory(
      'prop_house_TimedRound',
    );
    const timedRoundEthTxAuthStrategyFactory = await starknet.getContractFactory(
      'prop_house_TimedRoundEthereumTxAuthStrategy',
    );
    const timedRoundEthSigAuthStrategyFactory = await starknet.getContractFactory(
      'prop_house_TimedRoundEthereumSigAuthStrategy',
    );
    const factories = [
      roundDeployerFactory,
      ethExecutionStrategyFactory,
      strategyRegistryFactory,
      roundDependencyRegistryFactory,
      ethBlockRegistryFactory,
      vanillaGovPowerStrategyFactory,
      allowlistGovPowerStrategyFactory,
      ethBalanceOfGovPowerStrategyFactory,
      infiniteRoundEthTxAuthStrategyFactory,
      infiniteRoundEthSigAuthStrategyFactory,
      timedRoundEthTxAuthStrategyFactory,
      timedRoundEthSigAuthStrategyFactory,
    ];
    let nonce = await starknet.getNonce(starknetDeployer.address, {
      blockNumber: 'latest',
    });
    const promises: Promise<string>[] = [];
    for (const factory of factories) {
      promises.push(
        starknetDeployer.declare(factory, {
          maxFee: MAX_FEE,
          nonce: nonce++,
        }),
      );
      await sleep(5_000); // Naive approach to avoid gateway 429s and nonce issues
    }
    await Promise.all(promises);

    // Deploy core protocol contracts
    const manager = await managerFactory.deploy();
    const propHouse = await propHouseFactory.deploy(manager.address);

    const [creatorPassIssuer, starknetCommit] = await Promise.all([
      creatorPassIssuerFactory.deploy(propHouse.address, constants.AddressZero),
      starknetCommitFactory.deploy(args.starknetCore),
    ]);
    const messenger = await messengerFactory.deploy(args.starknetCore, propHouse.address);
    const roundFactory = await starknetDeployer.deploy(
      roundDeployerFactory,
      {
        origin_chain_id: ethNetwork.chainId,
        origin_messenger: messenger.address,
      },
      { maxFee: MAX_FEE },
    );
    const ethExecutionStrategy = await starknetDeployer.deploy(
      ethExecutionStrategyFactory,
      {
        round_factory: roundFactory.address,
      },
      {
        maxFee: MAX_FEE,
      },
    );
    const strategyRegistry = await starknetDeployer.deploy(
      strategyRegistryFactory,
      undefined,
      {
        maxFee: MAX_FEE,
      },
    );
    const roundDependencyRegistry = await starknetDeployer.deploy(
      roundDependencyRegistryFactory,
      {
        initial_owner: starknetDeployer.address,
      },
      {
        maxFee: MAX_FEE,
      },
    );
    const ethBlockRegistry = await starknetDeployer.deploy(
      ethBlockRegistryFactory,
      {
        l1_headers_store: args.herodotusL1HeadersStore,
      },
      {
        maxFee: MAX_FEE,
      },
    );


    // Deploy governance power strategy contracts
    const vanillaGovPowerStrategy = await starknetDeployer.deploy(
      vanillaGovPowerStrategyFactory,
      undefined,
      {
        maxFee: MAX_FEE,
      },
    );
    const allowlistGovPowerStrategy = await starknetDeployer.deploy(
      allowlistGovPowerStrategyFactory,
      undefined,
      {
        maxFee: MAX_FEE,
      },
    );
    const ethBalanceOfGovPowerStrategy = await starknetDeployer.deploy(
      ethBalanceOfGovPowerStrategyFactory,
      {
        fact_registry: args.herodotusFactRegistry,
        ethereum_block_registry: ethBlockRegistry.address,
      },
      { maxFee: MAX_FEE },
    );

    // Deploy community house contract
    const communityHouseImpl = await communityHouseImplFactory.deploy(
      propHouse.address,
      constants.AddressZero,
      creatorPassIssuer.address,
    );

    // Deploy infinite round contracts
    const infiniteRoundEthTxAuthStrategy = await starknetDeployer.deploy(
      infiniteRoundEthTxAuthStrategyFactory,
      {
        commit_address: starknetCommit.address,
      },
      { maxFee: MAX_FEE },
    );
    const infiniteRoundEthSigAuthStrategy = await starknetDeployer.deploy(
      infiniteRoundEthSigAuthStrategyFactory,
      {
        domain_separator: DOMAIN_SEPARATORS[ethNetwork.chainId],
      },
      { maxFee: MAX_FEE },
    );

    await starknetDeployer.declare(infiniteRoundL2Factory, {
      constants: {
        [STRATEGY_REGISTRY_ADDRESS_KEY]: strategyRegistry.address,
        [ROUND_DEP_REGISTRY_ADDRESS_KEY]: roundDependencyRegistry.address,
      },
      maxFee: MAX_FEE,
    });
    const infiniteRoundClassHash = await infiniteRoundL2Factory.getClassHash();

    const infiniteRoundImpl = await infiniteRoundImplFactory.deploy(
      infiniteRoundClassHash,
      propHouse.address,
      args.starknetCore,
      messenger.address,
      roundFactory.address,
      ethExecutionStrategy.address,
      constants.AddressZero,
    );

    // Deploy timed round contracts
    const timedRoundEthTxAuthStrategy = await starknetDeployer.deploy(
      timedRoundEthTxAuthStrategyFactory,
      {
        commit_address: starknetCommit.address,
      },
      { maxFee: MAX_FEE },
    );
    const timedRoundEthSigAuthStrategy = await starknetDeployer.deploy(
      timedRoundEthSigAuthStrategyFactory,
      {
        domain_separator: DOMAIN_SEPARATORS[ethNetwork.chainId],
      },
      { maxFee: MAX_FEE },
    );

    await starknetDeployer.declare(timedRoundL2Factory, {
      constants: {
        [STRATEGY_REGISTRY_ADDRESS_KEY]: strategyRegistry.address,
        [ROUND_DEP_REGISTRY_ADDRESS_KEY]: roundDependencyRegistry.address,
      },
      maxFee: MAX_FEE,
    });
    const timedRoundClassHash = await timedRoundL2Factory.getClassHash();

    const timedRoundImpl = await timedRoundImplFactory.deploy(
      timedRoundClassHash,
      propHouse.address,
      args.starknetCore,
      messenger.address,
      roundFactory.address,
      ethExecutionStrategy.address,
      constants.AddressZero,
    );

    // Configure contracts
    await (await manager.registerHouse(communityHouseImpl.address)).wait();
    await manager.registerRound(communityHouseImpl.address, timedRoundImpl.address);
    await manager.registerRound(communityHouseImpl.address, infiniteRoundImpl.address);

  
    // Add Ethereum auth strategies
    await starknetDeployer.invoke(
      roundDependencyRegistry,
      'update_dependencies_if_not_locked',
      [
        ethNetwork.chainId,
        utils.encoding.asciiToHex(RoundType.TIMED),
        DEPENDENCY_KEY.AUTH_STRATEGIES,
        2,
        timedRoundEthTxAuthStrategy.address,
        timedRoundEthSigAuthStrategy.address,
      ],
      {
        rawInput: true,
      },
    );
    await starknetDeployer.invoke(
      roundDependencyRegistry,
      'update_dependencies_if_not_locked',
      [
        ethNetwork.chainId,
        utils.encoding.asciiToHex(RoundType.INFINITE),
        DEPENDENCY_KEY.AUTH_STRATEGIES,
        2,
        infiniteRoundEthTxAuthStrategy.address,
        infiniteRoundEthSigAuthStrategy.address,
      ],
      {
        rawInput: true,
      },
    );

    // Add Ethereum execution strategies
    for (const type of Object.values(RoundType)) {
      await starknetDeployer.invoke(
        roundDependencyRegistry,
        'update_dependency_if_not_locked',
        {
          origin_chain_id: ethNetwork.chainId,
          round_type: utils.encoding.asciiToHex(type),
          key: DEPENDENCY_KEY.EXECUTION_STRATEGY,
          dependency: ethExecutionStrategy.address,
        },
      );
    }

    // Lock round dependencies
    for (const type of Object.values(RoundType)) {
      for (const key of Object.values(DEPENDENCY_KEY)) {
        await starknetDeployer.invoke(roundDependencyRegistry, 'lock_key', {
          origin_chain_id: ethNetwork.chainId,
          round_type: utils.encoding.asciiToHex(type),
          key,
        });
      }
    }

    const deployment = {
      ethereum: {
        address: {
          manager: manager.address,
          propHouse: propHouse.address,
          messenger: messenger.address,
          creatorPassIssuer: creatorPassIssuer.address,
          starknetCommit: starknetCommit.address,
          communityHouseImpl: communityHouseImpl.address,
          infiniteRoundImpl: infiniteRoundImpl.address,
          timedRoundImpl: timedRoundImpl.address,
        },
      },
      starknet: {
        address: {
          roundFactory: roundFactory.address,
          ethExecutionStrategy: ethExecutionStrategy.address,
          strategyRegistry: strategyRegistry.address,
          roundDependencyRegistry: roundDependencyRegistry.address,
          ethBlockRegistry: ethBlockRegistry.address,
          infiniteRoundEthTxAuthStrategy: infiniteRoundEthTxAuthStrategy.address,
          infiniteRoundEthSigAuthStrategy: infiniteRoundEthSigAuthStrategy.address,
          timedRoundEthTxAuthStrategy: timedRoundEthTxAuthStrategy.address,
          timedRoundEthSigAuthStrategy: timedRoundEthSigAuthStrategy.address,
          vanillaGovPowerStrategy: vanillaGovPowerStrategy.address,
          allowlistGovPowerStrategy: allowlistGovPowerStrategy.address,
          ethBalanceOfGovPowerStrategy: ethBalanceOfGovPowerStrategy.address,
          herodotus: config.herodotus,
        },
        classHash: {
          infiniteRound: infiniteRoundClassHash,
          timedRound: timedRoundClassHash,
        },
      },
    };

    if (!existsSync('./deployments')) {
      mkdirSync('./deployments');
    }
    writeFileSync('./deployments/goerli.json', JSON.stringify(deployment, null, 2));
  });
