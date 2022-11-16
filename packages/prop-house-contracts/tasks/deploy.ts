import {
  DeploymentManager__factory,
  FundingHouse__factory,
  HouseFactory__factory,
  RegistrarManager__factory,
  StarkNetCommit__factory,
  StarknetMessenger__factory,
  StrategyManager__factory,
  TimedFundingRoundStrategyValidator__factory,
  UpgradeManager__factory,
} from '../typechain';
import { task, types } from 'hardhat/config';
import { writeFileSync } from 'fs';
import { starknet } from 'hardhat';

enum ChainId {
  Mainnet = 1,
  Goerli = 5,
}

const starknetCoreContracts: Record<number, string> = {
  [ChainId.Mainnet]: '0xc662c410C0ECf747543f5bA90660f6ABeBD9C8c4',
  [ChainId.Goerli]: '0xde29d060D45901Fb19ED6C6e959EB22d8626708e',
};

const wethContracts: Record<number, string> = {
  [ChainId.Mainnet]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [ChainId.Goerli]: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
};

const fossilFactRegistryContracts: Record<number, string> = {
  [ChainId.Goerli]: '0x363108ac1521a47b4f7d82f8ba868199bc1535216bbedfc1b071ae93cc406fd',
};

const fossilL1HeadersStoreContracts: Record<number, string> = {
  [ChainId.Goerli]: '0x6ca3d25e901ce1fff2a7dd4079a24ff63ca6bbf8ba956efc71c1467975ab78f',
};

task('deploy', 'Deploys all Prop House protocol L1 & L2 contracts')
  .addParam('')
  .addOptionalParam('registrar', 'The registrar address', undefined, types.string)
  .addOptionalParam('starknetCore', 'The Starknet core contract address', undefined, types.string)
  .addOptionalParam('weth', 'The WETH contract address', undefined, types.string)
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
  .setAction(async (args, { ethers }) => {
    const ethNetwork = await ethers.provider.getNetwork();
    const [ethDeployer] = await ethers.getSigners();
    const starknetDeployer = await starknet.getAccountFromAddress(
      process.env.OZ_ACCOUNT_ADDRESS!,
      process.env.OZ_ACCOUNT_PRIVATE_KEY!,
      'OpenZeppelin',
    );

    if (!args.registrar) {
      args.registrar = ethDeployer.address;
    }
    if (!args.starknetCore) {
      const deployedStarknetCoreContract = starknetCoreContracts[ethNetwork.chainId];
      if (!deployedStarknetCoreContract) {
        throw new Error(
          `Can not auto-detect StarknetCore contract on chain ${ethNetwork.name}. Provide it with the --starknet-core arg.`,
        );
      }
      args.starknetCore = deployedStarknetCoreContract;
    }
    if (!args.weth) {
      const deployedWETHContract = wethContracts[ethNetwork.chainId];
      if (!deployedWETHContract) {
        throw new Error(
          `Can not auto-detect WETH contract on chain ${ethNetwork.name}. Provide it with the --weth arg.`,
        );
      }
      args.weth = deployedWETHContract;
    }
    if (!args.fossilFactRegistry) {
      const deployedFossilFactRegistryContract = fossilFactRegistryContracts[ethNetwork.chainId];
      if (!deployedFossilFactRegistryContract) {
        throw new Error(
          `Can not auto-detect Fossil fact registry contract on chain ${ethNetwork.name}. Provide it with the --fossil-fact-registry arg.`,
        );
      }
      args.fossilFactRegistry = deployedFossilFactRegistryContract;
    }
    if (!args.fossilL1HeadersStore) {
      const deployedFossilL1HeadersStoreContract =
        fossilL1HeadersStoreContracts[ethNetwork.chainId];
      if (!deployedFossilL1HeadersStoreContract) {
        throw new Error(
          `Can not auto-detect Fossil L1 headers store contract on chain ${ethNetwork.name}. Provide it with the --fossil-l1-headers-store arg.`,
        );
      }
      args.fossilL1HeadersStore = deployedFossilL1HeadersStoreContract;
    }

    // L1 factories
    const registrarManagerFactory = new RegistrarManager__factory(ethDeployer);
    const deploymentManagerFactory = new DeploymentManager__factory(ethDeployer);
    const upgradeManagerFactory = new UpgradeManager__factory(ethDeployer);
    const strategyManagerFactory = new StrategyManager__factory(ethDeployer);
    const houseDeployerFactory = new HouseFactory__factory(ethDeployer);
    const starknetCommitFactory = new StarkNetCommit__factory(ethDeployer);
    const starknetMessengerFactory = new StarknetMessenger__factory(ethDeployer);
    const fundingHouseFactory = new FundingHouse__factory(ethDeployer);
    const timedFundingRoundStrategyValidatorFactory =
      new TimedFundingRoundStrategyValidator__factory(ethDeployer);

    // L2 factories
    const houseStrategyDeployerFactory = await starknet.getContractFactory(
      './contracts/starknet/house_strategy_factory.cairo',
    );
    const ethHouseExecutionStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/common/execution/eth_house.cairo',
    );
    const votingStrategyRegistryFactory = await starknet.getContractFactory(
      './contracts/starknet/common/registry/voting_strategy_registry.cairo',
    );
    const timedFundingRoundStrategyL2Factory = await starknet.getContractFactory(
      './contracts/starknet/strategies/timed_funding_round/timed_funding_round.cairo',
    );
    const timedFundingRoundEthTxAuthStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/strategies/timed_funding_round/auth/eth_tx.cairo',
    );
    const timedFundingRoundEthSigAuthStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/strategies/timed_funding_round/auth/eth_sig.cairo',
    );
    const vanillaVotingStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/common/voting/vanilla.cairo',
    );
    const ethereumBalanceOfVotingStrategyFactory = await starknet.getContractFactory(
      './contracts/starknet/common/voting/ethereum_balance_of.cairo',
    );

    // Deploy core protocol contracts
    const registrarManager = await registrarManagerFactory.deploy(args.registrar);
    const [deploymentManager, upgradeManager, strategyManager] = await Promise.all([
      deploymentManagerFactory.deploy(registrarManager.address),
      upgradeManagerFactory.deploy(registrarManager.address),
      strategyManagerFactory.deploy(registrarManager.address),
    ]);
    const houseFactory = await houseDeployerFactory.deploy(deploymentManager.address);
    const starknetCommit = await starknetCommitFactory.deploy(args.starknetCore);
    const starknetMessenger = await starknetMessengerFactory.deploy(
      args.starknetCore,
      houseFactory.address,
    );
    const houseStrategyFactory = await houseStrategyDeployerFactory.deploy({
      starknet_messenger: starknetMessenger.address,
    });
    const ethHouseExecutionStrategy = await ethHouseExecutionStrategyFactory.deploy({
      house_strategy_factory_address: houseStrategyFactory.address,
    });
    const votingStrategyRegistry = await votingStrategyRegistryFactory.deploy({
      starknet_messenger: starknetMessenger.address,
    });

    // Deploy funding house contracts
    const timedFundingRoundEthTxAuthStrategy =
      await timedFundingRoundEthTxAuthStrategyFactory.deploy({
        starknet_commit_address: starknetCommit.address,
      });
    const timedFundingRoundEthSigAuthStrategy =
      await timedFundingRoundEthSigAuthStrategyFactory.deploy();
    const timedFundingRoundStrategyClassHash = await starknetDeployer.declare(
      timedFundingRoundStrategyL2Factory,
      {
        constants: {
          voting_strategy_registry: votingStrategyRegistry.address,
          eth_execution_strategy: ethHouseExecutionStrategy.address,
          eth_tx_auth_strategy: timedFundingRoundEthTxAuthStrategy.address,
          eth_sig_auth_strategy: timedFundingRoundEthSigAuthStrategy.address,
        },
      },
    );
    const timedFundingRoundStrategyValidator =
      await timedFundingRoundStrategyValidatorFactory.deploy(timedFundingRoundStrategyClassHash);
    const fundingHouseImpl = await fundingHouseFactory.deploy(
      ethHouseExecutionStrategy.address,
      votingStrategyRegistry.address,
      upgradeManager.address,
      strategyManager.address,
      starknetMessenger.address,
      houseStrategyFactory.address,
      args.weth,
    );

    // Deploy voting strategy contracts
    const vanillaVotingStrategy = await vanillaVotingStrategyFactory.deploy();
    const ethereumBalanceOfVotingStrategy = await ethereumBalanceOfVotingStrategyFactory.deploy(
      args.fossilFactRegistry,
      args.fossilL1HeadersStore,
    );

    // Configure contracts
    await deploymentManager.registerDeployment(fundingHouseImpl.address);
    await strategyManager['registerStrategy(bytes32,address)'](
      await fundingHouseImpl.id(),
      timedFundingRoundStrategyValidator.address,
    );

    const deployment = {
      ethereum: {
        registrarManager: registrarManager.address,
        deploymentManager: deploymentManager.address,
        upgradeManager: upgradeManager.address,
        strategyManager: strategyManager.address,
        houseFactory: houseFactory.address,
        starknetCommit: starknetCommit.address,
        starknetMessenger: starknetMessenger.address,
        timedFundingRoundStrategyValidator: timedFundingRoundStrategyValidator.address,
        fundingHouseImpl: fundingHouseImpl.address,
      },
      starknet: {
        houseStrategyFactory: houseStrategyFactory.address,
        ethHouseExecutionStrategy: ethHouseExecutionStrategy.address,
        votingStrategyRegistry: votingStrategyRegistry.address,
        timedFundingRoundEthTxAuthStrategy: timedFundingRoundEthTxAuthStrategy.address,
        vanillaVotingStrategy: vanillaVotingStrategy.address,
        ethereumBalanceOfVotingStrategy: ethereumBalanceOfVotingStrategy.address,
      },
    };
    writeFileSync('./deployments/goerli.json', JSON.stringify(deployment));
  });
