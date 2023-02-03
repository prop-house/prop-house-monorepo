// import {
//   DeploymentManager__factory,
//   FundingHouse__factory,
//   HouseFactory__factory,
//   RegistrarManager__factory,
//   StarkNetCommit__factory,
//   StarknetMessenger__factory,
//   StrategyManager__factory,
//   TimedFundingRound__factory,
//   UpgradeManager__factory,
// } from '../typechain';
// import { task, types } from 'hardhat/config';
// import { NonceManager } from '@ethersproject/experimental';
// import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs';
// import { DeployContractPayload, Provider } from 'starknet';

// enum ChainId {
//   Mainnet = 1,
//   Goerli = 5,
// }

// interface NetworkConfig {
//   starknet: {
//     network: 'mainnet-alpha' | 'goerli-alpha';
//     core: string;
//   };
//   weth: string;
//   fossil?: {
//     factRegistry: string;
//     l1HeadersStore: string;
//   };
// }

// const networkConfig: Record<number, NetworkConfig> = {
//   [ChainId.Mainnet]: {
//     starknet: {
//       network: 'mainnet-alpha',
//       core: '0xc662c410C0ECf747543f5bA90660f6ABeBD9C8c4',
//     },
//     weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
//   },
//   [ChainId.Goerli]: {
//     starknet: {
//       network: 'goerli-alpha',
//       core: '0xde29d060D45901Fb19ED6C6e959EB22d8626708e',
//     },
//     weth: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
//     fossil: {
//       factRegistry: '0x363108ac1521a47b4f7d82f8ba868199bc1535216bbedfc1b071ae93cc406fd',
//       l1HeadersStore: '0x6ca3d25e901ce1fff2a7dd4079a24ff63ca6bbf8ba956efc71c1467975ab78f',
//     },
//   },
// };

// const sleep = (ms = 1_000) => new Promise(resolve => setTimeout(resolve, ms));

// task('deploy', 'Deploys all Prop House protocol L1 & L2 contracts')
//   .addOptionalParam('registrar', 'The registrar address', undefined, types.string)
//   .addOptionalParam('starknetCore', 'The Starknet core contract address', undefined, types.string)
//   .addOptionalParam('weth', 'The WETH contract address', undefined, types.string)
//   .addOptionalParam(
//     'fossilFactRegistry',
//     'The Fossil fact registry contract address',
//     undefined,
//     types.string,
//   )
//   .addOptionalParam(
//     'fossilL1HeadersStore',
//     'The Fossil L1 headers store contract address',
//     undefined,
//     types.string,
//   )
//   .setAction(async (args, hre) => {
//     const { ethers, starknet } = hre;

//     const ethNetwork = await ethers.provider.getNetwork();
//     const config = networkConfig[ethNetwork.chainId];

//     const [ethSigner] = await ethers.getSigners();
//     const ethDeployer = new NonceManager(ethSigner as any);

//     const starknetProvider = new Provider({
//       sequencer: {
//         network: config.starknet.network,
//       },
//     });
//     const deployContract = starknetProvider.deployContract.bind(starknetProvider);
//     starknetProvider.deployContract = async (payload: DeployContractPayload) => {
//       await sleep(); // Naive approach to avoid strict gateway rate-limiting
//       return deployContract(payload);
//     };

//     if (!args.registrar) {
//       args.registrar = await ethDeployer.getAddress();
//     }
//     if (!args.starknetCore) {
//       if (!config.starknet?.core) {
//         throw new Error(
//           `Can not auto-detect StarknetCore contract on chain ${ethNetwork.name}. Provide it with the --starknet-core arg.`,
//         );
//       }
//       args.starknetCore = config.starknet.core;
//     }
//     if (!args.weth) {
//       if (!config.weth) {
//         throw new Error(
//           `Can not auto-detect WETH contract on chain ${ethNetwork.name}. Provide it with the --weth arg.`,
//         );
//       }
//       args.weth = config.weth;
//     }
//     if (!args.fossilFactRegistry) {
//       if (!config.fossil?.factRegistry) {
//         throw new Error(
//           `Can not auto-detect Fossil fact registry contract on chain ${ethNetwork.name}. Provide it with the --fossil-fact-registry arg.`,
//         );
//       }
//       args.fossilFactRegistry = config.fossil.factRegistry;
//     }
//     if (!args.fossilL1HeadersStore) {
//       if (!config.fossil?.l1HeadersStore) {
//         throw new Error(
//           `Can not auto-detect Fossil L1 headers store contract on chain ${ethNetwork.name}. Provide it with the --fossil-l1-headers-store arg.`,
//         );
//       }
//       args.fossilL1HeadersStore = config.fossil.l1HeadersStore;
//     }

//     // L1 factories
//     const registrarManagerFactory = new RegistrarManager__factory(ethDeployer);
//     const deploymentManagerFactory = new DeploymentManager__factory(ethDeployer);
//     const upgradeManagerFactory = new UpgradeManager__factory(ethDeployer);
//     const strategyManagerFactory = new StrategyManager__factory(ethDeployer);
//     const houseDeployerFactory = new HouseFactory__factory(ethDeployer);
//     const starknetCommitFactory = new StarkNetCommit__factory(ethDeployer);
//     const starknetMessengerFactory = new StarknetMessenger__factory(ethDeployer);
//     const fundingHouseFactory = new FundingHouse__factory(ethDeployer);
//     const timedFundingRoundStrategyImplFactory = new TimedFundingRound__factory(ethDeployer);

//     // L2 factories
//     const houseStrategyDeployerFactory = await starknet.getContractFactory(
//       './contracts/starknet/house_strategy_factory.cairo',
//     );
//     const ethExecutionStrategyFactory = await starknet.getContractFactory(
//       './contracts/starknet/common/execution/eth_strategy.cairo',
//     );
//     const votingStrategyRegistryFactory = await starknet.getContractFactory(
//       './contracts/starknet/common/registry/voting_strategy_registry.cairo',
//     );
//     const timedFundingRoundStrategyL2Factory = await starknet.getContractFactory(
//       './contracts/starknet/strategies/timed_funding_round/timed_funding_round.cairo',
//     );
//     const timedFundingRoundEthTxAuthStrategyFactory = await starknet.getContractFactory(
//       './contracts/starknet/strategies/timed_funding_round/auth/eth_tx.cairo',
//     );
//     const timedFundingRoundEthSigAuthStrategyFactory = await starknet.getContractFactory(
//       './contracts/starknet/strategies/timed_funding_round/auth/eth_sig.cairo',
//     );
//     const vanillaVotingStrategyFactory = await starknet.getContractFactory(
//       './contracts/starknet/common/voting/vanilla.cairo',
//     );
//     const ethereumBalanceOfVotingStrategyFactory = await starknet.getContractFactory(
//       './contracts/starknet/common/voting/ethereum_balance_of.cairo',
//     );

//     // Deploy core protocol contracts
//     const registrarManager = await registrarManagerFactory.deploy(args.registrar);
//     const [deploymentManager, upgradeManager, strategyManager] = await Promise.all([
//       deploymentManagerFactory.deploy(registrarManager.address),
//       upgradeManagerFactory.deploy(registrarManager.address),
//       strategyManagerFactory.deploy(registrarManager.address),
//     ]);
//     const houseFactory = await houseDeployerFactory.deploy(deploymentManager.address);
//     const starknetCommit = await starknetCommitFactory.deploy(args.starknetCore);
//     const starknetMessenger = await starknetMessengerFactory.deploy(
//       args.starknetCore,
//       houseFactory.address,
//     );
//     const houseStrategyFactory = await starknetProvider.deployContract({
//       contract: readFileSync(houseStrategyDeployerFactory.metadataPath, 'ascii'),
//       constructorCalldata: [starknetMessenger.address],
//     });
//     const ethExecutionStrategy = await starknetProvider.deployContract({
//       contract: readFileSync(ethExecutionStrategyFactory.metadataPath, 'ascii'),
//       constructorCalldata: [houseStrategyFactory.contract_address],
//     });
//     const votingStrategyRegistry = await starknetProvider.deployContract({
//       contract: readFileSync(votingStrategyRegistryFactory.metadataPath, 'ascii'),
//       constructorCalldata: [starknetMessenger.address],
//     });

//     // Deploy funding house contracts
//     const timedFundingRoundEthTxAuthStrategy = await starknetProvider.deployContract({
//       contract: readFileSync(timedFundingRoundEthTxAuthStrategyFactory.metadataPath, 'ascii'),
//       constructorCalldata: [starknetCommit.address],
//     });
//     const timedFundingRoundEthSigAuthStrategy = await starknetProvider.deployContract({
//       contract: readFileSync(timedFundingRoundEthSigAuthStrategyFactory.metadataPath, 'ascii'),
//     });

//     const generatedTimedFundingRoundStrategyMetadataPath =
//       hre.starknetWrapper.writeConstantsToOutput(timedFundingRoundStrategyL2Factory.metadataPath, {
//         voting_strategy_registry: votingStrategyRegistry.contract_address,
//         eth_execution_strategy: ethExecutionStrategy.contract_address,
//         eth_tx_auth_strategy: timedFundingRoundEthTxAuthStrategy.contract_address,
//         eth_sig_auth_strategy: timedFundingRoundEthSigAuthStrategy.contract_address,
//       });
//     // Declare using CLI due to https://github.com/0xs34n/starknet.js/issues/311
//     const timedFundingRoundStrategyClassHash = await hre.starknetWrapper.getClassHash(
//       generatedTimedFundingRoundStrategyMetadataPath,
//     );
//     const timedFundingRoundStrategyImpl = await timedFundingRoundStrategyImplFactory.deploy(
//       timedFundingRoundStrategyClassHash
//     );
//     const fundingHouseImpl = await fundingHouseFactory.deploy(
//       ethExecutionStrategy.contract_address,
//       votingStrategyRegistry.contract_address,
//       upgradeManager.address,
//       strategyManager.address,
//       starknetMessenger.address,
//       houseStrategyFactory.contract_address,
//       args.weth,
//     );

//     // Deploy voting strategy contracts
//     const vanillaVotingStrategy = await starknetProvider.deployContract({
//       contract: readFileSync(vanillaVotingStrategyFactory.metadataPath, 'ascii'),
//     });
//     const ethereumBalanceOfVotingStrategy = await starknetProvider.deployContract({
//       contract: readFileSync(ethereumBalanceOfVotingStrategyFactory.metadataPath, 'ascii'),
//       constructorCalldata: [args.fossilFactRegistry, args.fossilL1HeadersStore],
//     });

//     // Configure contracts
//     await deploymentManager.registerDeployment(fundingHouseImpl.address);
//     await strategyManager['registerStrategy(bytes32,address)'](
//       await fundingHouseImpl.id(),
//       timedFundingRoundStrategyValidator.address,
//     );

//     const deployment = {
//       ethereum: {
//         address: {
//           registrarManager: registrarManager.address,
//           deploymentManager: deploymentManager.address,
//           upgradeManager: upgradeManager.address,
//           strategyManager: strategyManager.address,
//           houseFactory: houseFactory.address,
//           starknetCommit: starknetCommit.address,
//           starknetMessenger: starknetMessenger.address,
//           timedFundingRoundStrategyValidator: timedFundingRoundStrategyValidator.address,
//           fundingHouseImpl: fundingHouseImpl.address,
//         },
//       },
//       starknet: {
//         address: {
//           houseStrategyFactory: houseStrategyFactory.contract_address,
//           ethExecutionStrategy: ethExecutionStrategy.contract_address,
//           votingStrategyRegistry: votingStrategyRegistry.contract_address,
//           timedFundingRoundEthTxAuthStrategy: timedFundingRoundEthTxAuthStrategy.contract_address,
//           timedFundingRoundEthSigAuthStrategy: timedFundingRoundEthSigAuthStrategy.contract_address,
//           vanillaVotingStrategy: vanillaVotingStrategy.contract_address,
//           ethereumBalanceOfVotingStrategy: ethereumBalanceOfVotingStrategy.contract_address,
//         },
//         classHash: {
//           timedFundingRoundStrategy: timedFundingRoundStrategyClassHash,
//         },
//       },
//     };

//     if (!existsSync('./deployments')) {
//       mkdirSync('./deployments');
//     }
//     writeFileSync('./deployments/goerli.json', JSON.stringify(deployment, null, 2));
//   });
