import {
  Manager__factory,
  Messenger__factory,
  CreatorPassIssuer__factory,
  PropHouse__factory,
  StarkNetCommit__factory,
  FundingHouse__factory,
  TimedFundingRound__factory,
} from '../typechain';
import { task, types } from 'hardhat/config';
import { NonceManager } from '@ethersproject/experimental';
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
import { DeployContractPayload, Provider } from 'starknet';
import { constants } from 'ethers';

enum ChainId {
  Mainnet = 1,
  Goerli = 5,
}

interface NetworkConfig {
  starknet: {
    network: 'mainnet-alpha' | 'goerli-alpha';
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
      network: 'mainnet-alpha',
      core: '0xc662c410C0ECf747543f5bA90660f6ABeBD9C8c4',
    },
  },
  [ChainId.Goerli]: {
    starknet: {
      network: 'goerli-alpha',
      core: '0xde29d060D45901Fb19ED6C6e959EB22d8626708e',
    },
    fossil: {
      factRegistry: '0x363108ac1521a47b4f7d82f8ba868199bc1535216bbedfc1b071ae93cc406fd',
      l1HeadersStore: '0x6ca3d25e901ce1fff2a7dd4079a24ff63ca6bbf8ba956efc71c1467975ab78f',
    },
  },
};

const sleep = (ms = 1_000) => new Promise(resolve => setTimeout(resolve, ms));

task('deploy', 'Deploys all Prop House protocol L1 & L2 contracts')
  .addOptionalParam('registrar', 'The registrar address', undefined, types.string)
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

    const starknetProvider = new Provider({
      sequencer: {
        network: config.starknet.network,
      },
    });
    const deployContract = starknetProvider.deployContract.bind(starknetProvider);
    starknetProvider.deployContract = async (payload: DeployContractPayload) => {
      await sleep(); // Naive approach to avoid strict gateway rate-limiting
      return deployContract(payload);
    };

    if (!args.registrar) {
      args.registrar = await ethDeployer.getAddress();
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
    const fundingHouseImplFactory = new FundingHouse__factory(ethDeployer);
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
    const ethereumBalanceOfVotingStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/common/voting/ethereum_balance_of.cairo',
    );

    // Deploy core protocol contracts
    const manager = await managerFactory.deploy();
    const propHouse = await propHouseFactory.deploy(manager.address);

    const [creatorPassIssuer, starknetCommit] = await Promise.all([
      creatorPassIssuerFactory.deploy(propHouse.address, constants.AddressZero),
      starknetCommitFactory.deploy(args.starknetCore),
    ]);
    const messenger = await messengerFactory.deploy(args.starknetCore, propHouse.address);
    const roundFactory = await starknetProvider.deployContract({
      contract: readFileSync(roundDeployerFactory.metadataPath, 'ascii'),
      constructorCalldata: [messenger.address],
    });
    const ethExecutionStrategy = await starknetProvider.deployContract({
      contract: readFileSync(ethExecutionStrategyFactory.metadataPath, 'ascii'),
      constructorCalldata: [roundFactory.contract_address],
    });
    const votingStrategyRegistry = await starknetProvider.deployContract({
      contract: readFileSync(votingStrategyRegistryFactory.metadataPath, 'ascii'),
    });

    // Deploy funding house contracts
    const timedFundingRoundEthTxAuthStrategy = await starknetProvider.deployContract({
      contract: readFileSync(timedFundingRoundEthTxAuthStrategyFactory.metadataPath, 'ascii'),
      constructorCalldata: [starknetCommit.address],
    });
    const timedFundingRoundEthSigAuthStrategy = await starknetProvider.deployContract({
      contract: readFileSync(timedFundingRoundEthSigAuthStrategyFactory.metadataPath, 'ascii'),
    });

    const generatedTimedFundingRoundMetadataPath = hre.starknetWrapper.writeConstantsToOutput(
      timedFundingRoundStrategyL2Factory.metadataPath,
      {
        voting_strategy_registry: votingStrategyRegistry.contract_address,
        eth_execution_strategy: ethExecutionStrategy.contract_address,
        eth_tx_auth_strategy: timedFundingRoundEthTxAuthStrategy.contract_address,
        eth_sig_auth_strategy: timedFundingRoundEthSigAuthStrategy.contract_address,
      },
    );
    // Declare using CLI due to https://github.com/0xs34n/starknet.js/issues/311
    const timedFundingRoundClassHash = await hre.starknetWrapper.getClassHash(
      generatedTimedFundingRoundMetadataPath,
    );
    const timedFundingRoundImpl = await timedFundingRoundImplFactory.deploy(
      timedFundingRoundClassHash,
      propHouse.address,
      args.starknetCore,
      messenger.address,
      constants.AddressZero,
      roundFactory.contract_address,
      ethExecutionStrategy.contract_address,
    );
    const fundingHouseImpl = await fundingHouseImplFactory.deploy(
      propHouse.address,
      constants.AddressZero,
      creatorPassIssuer.address,
    );

    // Deploy voting strategy contracts
    const vanillaVotingStrategy = await starknetProvider.deployContract({
      contract: readFileSync(vanillaVotingStrategyFactory.metadataPath, 'ascii'),
    });
    const ethereumBalanceOfVotingStrategy = await starknetProvider.deployContract({
      contract: readFileSync(ethereumBalanceOfVotingStrategyFactory.metadataPath, 'ascii'),
      constructorCalldata: [args.fossilFactRegistry, args.fossilL1HeadersStore],
    });

    // Configure contracts
    await manager.registerHouse(fundingHouseImpl.address);
    await manager.registerRound(fundingHouseImpl.address, timedFundingRoundImpl.address);

    const deployment = {
      ethereum: {
        address: {
          manager: manager.address,
          propHouse: propHouse.address,
          messenger: messenger.address,
          creatorPassIssuer: creatorPassIssuer.address,
          starknetCommit: starknetCommit.address,
          fundingHouseImpl: fundingHouseImpl.address,
          timedFundingRoundImpl: timedFundingRoundImpl.address,
        },
      },
      starknet: {
        address: {
          roundFactory: roundFactory.contract_address,
          ethExecutionStrategy: ethExecutionStrategy.contract_address,
          votingStrategyRegistry: votingStrategyRegistry.contract_address,
          timedFundingRoundEthTxAuthStrategy: timedFundingRoundEthTxAuthStrategy.contract_address,
          timedFundingRoundEthSigAuthStrategy: timedFundingRoundEthSigAuthStrategy.contract_address,
          vanillaVotingStrategy: vanillaVotingStrategy.contract_address,
          ethereumBalanceOfVotingStrategy: ethereumBalanceOfVotingStrategy.contract_address,
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
