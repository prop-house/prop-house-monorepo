import { starknet } from 'hardhat';
import { commonL1Setup } from './common';
import {
  FundingHouse__factory,
  MockWETH__factory,
  TimedFundingRoundStrategyValidator__factory,
} from '../../../typechain';

export const fundingHouseSetup = async () => {
  const config = await commonL1Setup();

  const starknetSigner = await starknet.deployAccount('OpenZeppelin');

  const houseStrategyDeployerFactory = await starknet.getContractFactory(
    './contracts/starknet/house_strategy_factory.cairo',
  );
  const ethHouseExecutionStrategyFactory = await starknet.getContractFactory(
    './contracts/starknet/common/execution/eth_house.cairo',
  );
  const votingStrategyRegistryFactory = await starknet.getContractFactory(
    './contracts/starknet/common/registry/voting_strategy_registry.cairo',
  );

  const fundingHouseFactory = new FundingHouse__factory(config.registrar);
  const wethFactory = new MockWETH__factory(config.registrar);

  const houseStrategyFactory = await houseStrategyDeployerFactory.deploy({
    starknet_messenger: config.starknetMessenger.address,
  });
  const ethHouseExecutionStrategy = await ethHouseExecutionStrategyFactory.deploy({
    house_strategy_factory_address: houseStrategyFactory.address,
  });
  const votingStrategyRegistry = await votingStrategyRegistryFactory.deploy({
    starknet_messenger: config.starknetMessenger.address,
  });

  const weth = await wethFactory.deploy();
  const fundingHouseImpl = await fundingHouseFactory.deploy(
    ethHouseExecutionStrategy.address,
    votingStrategyRegistry.address,
    config.upgradeManager.address,
    config.strategyManager.address,
    config.starknetMessenger.address,
    houseStrategyFactory.address,
    weth.address,
  );

  await config.deploymentManager.registerDeployment(fundingHouseImpl.address);

  return {
    ...config,
    starknetSigner,
    fundingHouseImpl,
    houseStrategyFactory,
    votingStrategyRegistry,
    ethHouseExecutionStrategy,
  };
};

export const fundingHouseTimedFundingRoundSetup = async () => {
  const config = await fundingHouseSetup();

  const timedFundingRoundStrategyValidatorFactory = new TimedFundingRoundStrategyValidator__factory(
    config.registrar,
  );
  const timedFundingRoundStrategyL2Factory = await starknet.getContractFactory(
    './contracts/starknet/strategies/timed_funding_round/timed_funding_round.cairo',
  );

  const timedFundingRoundEthTxAuthStrategyFactory = await starknet.getContractFactory(
    './contracts/starknet/strategies/timed_funding_round/auth/eth_tx.cairo',
  );

  const timedFundingRoundEthTxAuthStrategy = await timedFundingRoundEthTxAuthStrategyFactory.deploy(
    {
      starknet_commit_address: config.starknetCommit.address,
    },
  );

  const timedFundingRoundStrategyClassHash = await config.starknetSigner.declare(
    timedFundingRoundStrategyL2Factory,
    {
      constants: {
        voting_strategy_registry: config.votingStrategyRegistry.address,
        eth_execution_strategy: config.ethHouseExecutionStrategy.address,
        eth_tx_auth_strategy: timedFundingRoundEthTxAuthStrategy.address,
      },
    },
  );
  const timedFundingRoundStrategyValidator = await timedFundingRoundStrategyValidatorFactory.deploy(
    timedFundingRoundStrategyClassHash,
  );

  await config.strategyManager['registerStrategy(bytes32,address)'](
    await config.fundingHouseImpl.id(),
    timedFundingRoundStrategyValidator.address,
  );

  return {
    ...config,
    timedFundingRoundStrategyValidator,
    timedFundingRoundStrategyL2Factory,
    timedFundingRoundStrategyClassHash,
    timedFundingRoundEthTxAuthStrategy,
  };
};
