import {
  Manager__factory,
  Messenger__factory,
  CreatorPassIssuer__factory,
  PropHouse__factory,
  StarkNetCommit__factory,
  CommunityHouse__factory,
  TimedFundingRound__factory,
} from '../typechain';
import { task, types } from 'hardhat/config';
import { NonceManager } from '@ethersproject/experimental';
import { Starknet } from 'starknet-hardhat-plugin-extended/dist/src/types/starknet';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { constants } from 'ethers';

enum ChainId {
  Mainnet = 1,
  Goerli = 5,
}

interface NetworkConfig {
  starknet: {
    core: string;
  };
  fossil?: {
    factRegistry: string;
    l1HeadersStore: string;
  };
}

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
    fossil: {
      factRegistry: '0x363108ac1521a47b4f7d82f8ba868199bc1535216bbedfc1b071ae93cc406fd',
      l1HeadersStore: '0x6ca3d25e901ce1fff2a7dd4079a24ff63ca6bbf8ba956efc71c1467975ab78f',
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
    'fossilFactRegistry',
    'The Fossil fact registry contract address',
    undefined,
    types.string,
  )
  .addOptionalParam(
    'fossilL1HeadersStore',
    'The Fossil L1 headers store contract address',
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
    if (!args.fossilFactRegistry) {
      if (!config.fossil?.factRegistry) {
        throw new Error(
          `Can not auto-detect Fossil fact registry contract on chain ${ethNetwork.name}. Provide it with the --fossil-fact-registry arg.`,
        );
      }
      args.fossilFactRegistry = config.fossil.factRegistry;
    }
    if (!args.fossilL1HeadersStore) {
      if (!config.fossil?.l1HeadersStore) {
        throw new Error(
          `Can not auto-detect Fossil L1 headers store contract on chain ${ethNetwork.name}. Provide it with the --fossil-l1-headers-store arg.`,
        );
      }
      args.fossilL1HeadersStore = config.fossil.l1HeadersStore;
    }

    // L1 factories
    const managerFactory = new Manager__factory(ethDeployer);
    const propHouseFactory = new PropHouse__factory(ethDeployer);
    const messengerFactory = new Messenger__factory(ethDeployer);
    const creatorPassIssuerFactory = new CreatorPassIssuer__factory(ethDeployer);
    const starknetCommitFactory = new StarkNetCommit__factory(ethDeployer);
    const communityHouseImplFactory = new CommunityHouse__factory(ethDeployer);
    const timedFundingRoundImplFactory = new TimedFundingRound__factory(ethDeployer);

    // L2 factories
    const roundDeployerFactory = await starknet.getContractFactory(
      './contracts/starknet/round_factory.cairo',
    );
    const ethExecutionStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/common/execution/eth_strategy.cairo',
    );
    const votingStrategyRegistryFactory = await starknet.getContractFactory(
      './contracts/starknet/common/registry/voting_strategy_registry.cairo',
    );
    const timedFundingRoundStrategyL2Factory = await starknet.getContractFactory(
      './contracts/starknet/rounds/timed_funding_round/timed_funding_round.cairo',
    );
    const timedFundingRoundEthTxAuthStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/rounds/timed_funding_round/auth/eth_tx.cairo',
    );
    const timedFundingRoundEthSigAuthStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/rounds/timed_funding_round/auth/eth_sig.cairo',
    );
    const vanillaVotingStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/common/voting/vanilla.cairo',
    );
    const merkleWhitelistVotingStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/common/voting/merkle_whitelist.cairo',
    );
    const ethereumBalanceOfVotingStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/common/voting/ethereum_balance_of.cairo',
    );
    const ethereumBalanceOfMultiplierVotingStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/common/voting/ethereum_balance_of_multiplier.cairo',
    );
    const factories = [
      roundDeployerFactory,
      ethExecutionStrategyFactory,
      votingStrategyRegistryFactory,
      timedFundingRoundEthTxAuthStrategyFactory,
      timedFundingRoundEthSigAuthStrategyFactory,
      vanillaVotingStrategyFactory,
      merkleWhitelistVotingStrategyFactory,
      ethereumBalanceOfVotingStrategyFactory,
      ethereumBalanceOfMultiplierVotingStrategyFactory,
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
      await sleep(5_000); // Naive approach to avoid gateway 429s
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
        l1_messenger: messenger.address,
      },
      { maxFee: MAX_FEE },
    );
    const ethExecutionStrategy = await starknetDeployer.deploy(
      ethExecutionStrategyFactory,
      {
        round_factory_address: roundFactory.address,
      },
      {
        maxFee: MAX_FEE,
      },
    );
    const votingStrategyRegistry = await starknetDeployer.deploy(
      votingStrategyRegistryFactory,
      undefined,
      {
        maxFee: MAX_FEE,
      },
    );

    // Deploy house & round contracts contracts
    const timedFundingRoundEthTxAuthStrategy = await starknetDeployer.deploy(
      timedFundingRoundEthTxAuthStrategyFactory,
      {
        starknet_commit_address: starknetCommit.address,
      },
      { maxFee: MAX_FEE },
    );
    const timedFundingRoundEthSigAuthStrategy = await starknetDeployer.deploy(
      timedFundingRoundEthSigAuthStrategyFactory,
      undefined,
      { maxFee: MAX_FEE },
    );

    const timedFundingRoundClassHash = await starknetDeployer.declare(
      timedFundingRoundStrategyL2Factory,
      {
        maxFee: MAX_FEE,
        constants: {
          voting_strategy_registry: votingStrategyRegistry.address,
          eth_execution_strategy: ethExecutionStrategy.address,
          eth_tx_auth_strategy: timedFundingRoundEthTxAuthStrategy.address,
          eth_sig_auth_strategy: timedFundingRoundEthSigAuthStrategy.address,
        },
      },
    );
    const timedFundingRoundImpl = await timedFundingRoundImplFactory.deploy(
      timedFundingRoundClassHash,
      propHouse.address,
      args.starknetCore,
      messenger.address,
      constants.AddressZero,
      roundFactory.address,
      ethExecutionStrategy.address,
    );
    const communityHouseImpl = await communityHouseImplFactory.deploy(
      propHouse.address,
      constants.AddressZero,
      creatorPassIssuer.address,
    );

    // Deploy voting strategy contracts
    const vanillaVotingStrategy = await starknetDeployer.deploy(
      vanillaVotingStrategyFactory,
      undefined,
      {
        maxFee: MAX_FEE,
      },
    );
    const merkleWhitelistVotingStrategy = await starknetDeployer.deploy(
      merkleWhitelistVotingStrategyFactory,
      undefined,
      {
        maxFee: MAX_FEE,
      },
    );
    const ethereumBalanceOfVotingStrategy = await starknetDeployer.deploy(
      ethereumBalanceOfVotingStrategyFactory,
      {
        fact_registry_address: args.fossilFactRegistry,
        l1_headers_store_address: args.fossilL1HeadersStore,
      },
      { maxFee: MAX_FEE },
    );
    const ethereumBalanceOfMultiplierVotingStrategy = await starknetDeployer.deploy(
      ethereumBalanceOfMultiplierVotingStrategyFactory,
      {
        fact_registry_address: args.fossilFactRegistry,
        l1_headers_store_address: args.fossilL1HeadersStore,
      },
      { maxFee: MAX_FEE },
    );

    // Configure contracts
    await manager.registerHouse(communityHouseImpl.address);
    await manager.registerRound(communityHouseImpl.address, timedFundingRoundImpl.address);

    const deployment = {
      ethereum: {
        address: {
          manager: manager.address,
          propHouse: propHouse.address,
          messenger: messenger.address,
          creatorPassIssuer: creatorPassIssuer.address,
          starknetCommit: starknetCommit.address,
          communityHouseImpl: communityHouseImpl.address,
          timedFundingRoundImpl: timedFundingRoundImpl.address,
        },
      },
      starknet: {
        address: {
          roundFactory: roundFactory.address,
          ethExecutionStrategy: ethExecutionStrategy.address,
          votingStrategyRegistry: votingStrategyRegistry.address,
          timedFundingRoundEthTxAuthStrategy: timedFundingRoundEthTxAuthStrategy.address,
          timedFundingRoundEthSigAuthStrategy: timedFundingRoundEthSigAuthStrategy.address,
          vanillaVotingStrategy: vanillaVotingStrategy.address,
          merkleWhitelistVotingStrategy: merkleWhitelistVotingStrategy.address,
          ethereumBalanceOfVotingStrategy: ethereumBalanceOfVotingStrategy.address,
          ethereumBalanceOfMultiplierVotingStrategy:
            ethereumBalanceOfMultiplierVotingStrategy.address,
        },
        classHash: {
          timedFundingRound: timedFundingRoundClassHash,
        },
      },
    };

    if (!existsSync('./deployments')) {
      mkdirSync('./deployments');
    }
    writeFileSync('./deployments/goerli.json', JSON.stringify(deployment, null, 2));
  });
