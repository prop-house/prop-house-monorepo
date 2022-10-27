import { starknet, ethers } from 'hardhat';
import { commonL1Setup } from './common';
import { FundingHouse__factory, TimedFundingRoundStrategy__factory } from '../../../typechain';

export const fundingHouseSetup = async () => {
  const config = await commonL1Setup();

  const houseStrategyDeployerFactory = await starknet.getContractFactory(
    './src/starknet/house_strategy_factory.cairo',
  );
  const merkleRootExecutionStrategyFactory = await starknet.getContractFactory(
    './src/starknet/common/execution/merkle_root.cairo',
  );
  const votingStrategyRegistryFactory = await starknet.getContractFactory(
    './src/starknet/common/registry/voting_strategy_registry.cairo',
  );

  // The deploy transaction always runs out of gas when deploying from the `FundingHouse__factory` class. Investigate at some point.
  const fundingHouseFactory = (await ethers.getContractFactory(
    'FundingHouse',
  )) as FundingHouse__factory;

  const houseStrategyFactory = await houseStrategyDeployerFactory.deploy({
    starknet_messenger: config.starknetMessenger.address,
  });
  const merkleRootExecutionStrategy = await merkleRootExecutionStrategyFactory.deploy({
    house_strategy_factory_address: houseStrategyFactory.address,
  });
  const votingStrategyRegistry = await votingStrategyRegistryFactory.deploy({
    starknet_messenger: config.starknetMessenger.address,
  });

  const fundingHouseImpl = await fundingHouseFactory.deploy(
    merkleRootExecutionStrategy.address,
    merkleRootExecutionStrategy.address, // TODO: Consolidate
    votingStrategyRegistry.address,
    config.upgradeManager.address,
    config.strategyManager.address,
    config.starknetMessenger.address,
    houseStrategyFactory.address,
  );

  await config.deploymentManager.registerDeployment(fundingHouseImpl.address);

  return {
    ...config,
    fundingHouseImpl,
    houseStrategyFactory,
    votingStrategyRegistry,
  };
};

export const fundingHouseTimedFundingRoundSetup = async () => {
  const config = await fundingHouseSetup();

  const timedFundingRoundStrategyL1Factory = new TimedFundingRoundStrategy__factory(
    config.registrar,
  );
  const timedFundingRoundStrategyL2Factory = await starknet.getContractFactory(
    './src/starknet/strategies/timed_funding_round/timed_funding_round.cairo',
  );

  const timedFundingRoundEthTxAuthStrategyFactory = await starknet.getContractFactory(
    './src/starknet/strategies/timed_funding_round/auth/eth_tx.cairo',
  );

  const timedFundingRoundEthTxAuthStrategy = await timedFundingRoundEthTxAuthStrategyFactory.deploy(
    {
      starknet_commit_address: config.starknetCommit.address,
    },
  );

  const timedFundingRoundStrategyClassHash = await timedFundingRoundStrategyL2Factory.declare({
    constants: {
      VOTING_STRATEGY_REGISTRY: config.votingStrategyRegistry.address,
      ETH_TX_AUTH_STRATEGY: timedFundingRoundEthTxAuthStrategy.address,
    },
  });
  const timedFundingRoundStrategy = await timedFundingRoundStrategyL1Factory.deploy(
    timedFundingRoundStrategyClassHash,
  );

  await config.strategyManager['registerStrategy(bytes32,address)'](
    await config.fundingHouseImpl.id(),
    timedFundingRoundStrategy.address,
  );

  return {
    ...config,
    timedFundingRoundStrategy,
    timedFundingRoundStrategyL2Factory,
    timedFundingRoundStrategyClassHash,
    timedFundingRoundEthTxAuthStrategy,
  };
};
