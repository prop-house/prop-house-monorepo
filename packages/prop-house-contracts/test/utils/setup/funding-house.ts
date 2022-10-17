import { starknet, ethers } from 'hardhat';
import { commonL1Setup } from './common';

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

  const fundingHouseFactory = await ethers.getContractFactory('FundingHouse');

  const houseStrategyFactory = await houseStrategyDeployerFactory.deploy();
  const merkleRootExecutionStrategy = await merkleRootExecutionStrategyFactory.deploy({
    house_strategy_factory_address: houseStrategyFactory.address,
  });
  const votingStrategyRegistry = await votingStrategyRegistryFactory.deploy({
    l1_bridge: config.starknetMessenger.address,
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
  };
};

export const fundingHouseTimedFundingRoundSetup = async () => {
  const config = await fundingHouseSetup();

  const timedFundingRoundStrategyL1Factory = await ethers.getContractFactory(
    'TimedFundingRoundStrategy',
  );
  const timedFundingRoundStrategyL2Factory = await starknet.getContractFactory(
    './src/starknet/strategies/timed_funding_round/timed_funding_round.cairo',
  );

  const [timedFundingRoundStrategy, timedFundingRoundStrategyClassHash] = await Promise.all([
    timedFundingRoundStrategyL1Factory.deploy(),
    timedFundingRoundStrategyL2Factory.declare(),
  ]);

  // prettier-ignore
  const expectedTimedFundingRoundClassHash = await timedFundingRoundStrategy.HOUSE_STRATEGY_CLASS_HASH();
  const actualTimedFundingRoundClassHash = ethers.BigNumber.from(
    timedFundingRoundStrategyClassHash,
  ).toString();
  if (expectedTimedFundingRoundClassHash.toString() !== actualTimedFundingRoundClassHash) {
    throw new Error(
      `TimedFundingRoundStrategy class has mismatch. Expected: ${expectedTimedFundingRoundClassHash}. Actual: ${actualTimedFundingRoundClassHash}.`,
    );
  }

  await config.strategyManager['registerStrategy(bytes32,address)'](
    await config.fundingHouseImpl.id(),
    timedFundingRoundStrategy.address,
  );

  return {
    ...config,
    timedFundingRoundStrategy,
    timedFundingRoundStrategyClassHash,
  };
};

export const fundingHouseTimedFundingRoundEthTxSetup = async () => {
  const config = await fundingHouseTimedFundingRoundSetup();

  const timedFundingRoundEthTxAuthStrategyFactory = await starknet.getContractFactory(
    './src/starknet/strategies/timed_funding_round/auth/eth_tx.cairo',
  );

  const timedFundingRoundEthTxAuthStrategy = await timedFundingRoundEthTxAuthStrategyFactory.deploy(
    {
      starknet_commit_address: config.starknetCommit.address,
    },
  );

  return {
    ...config,
    timedFundingRoundEthTxAuthStrategy,
  };
};
