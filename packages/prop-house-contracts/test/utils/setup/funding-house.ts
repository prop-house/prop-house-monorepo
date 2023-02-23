import { starknet } from 'hardhat';
import { commonL1Setup } from './common';
import { FundingHouse__factory, TimedFundingRound__factory } from '../../../typechain';
import { constants } from 'ethers';

export const fundingHouseSetup = async () => {
  const config = await commonL1Setup();

  const [{ address, private_key }] = await starknet.devnet.getPredeployedAccounts();
  const starknetSigner = await starknet.OpenZeppelinAccount.getAccountFromAddress(
    address,
    private_key,
  );

  const roundDeployerFactory = await starknet.getContractFactory(
    './contracts/starknet/round_factory.cairo',
  );
  const ethExecutionStrategyFactory = await starknet.getContractFactory(
    './contracts/starknet/common/execution/eth_strategy.cairo',
  );
  const votingStrategyRegistryFactory = await starknet.getContractFactory(
    './contracts/starknet/common/registry/voting_strategy_registry.cairo',
  );
  await starknetSigner.declare(roundDeployerFactory);
  await starknetSigner.declare(ethExecutionStrategyFactory);
  await starknetSigner.declare(votingStrategyRegistryFactory);

  const fundingHouseFactory = new FundingHouse__factory(config.deployer);

  const roundFactory = await starknetSigner.deploy(roundDeployerFactory, {
    l1_messenger: config.messenger.address,
  });
  const ethExecutionStrategy = await starknetSigner.deploy(ethExecutionStrategyFactory, {
    round_factory_address: roundFactory.address,
  });
  const votingStrategyRegistry = await starknetSigner.deploy(votingStrategyRegistryFactory);

  const fundingHouseImpl = await fundingHouseFactory.deploy(
    config.propHouse.address,
    constants.AddressZero,
    config.creatorPassIssuer.address,
  );

  await config.manager.registerHouse(fundingHouseImpl.address);

  return {
    ...config,
    starknetSigner,
    fundingHouseImpl,
    roundFactory,
    votingStrategyRegistry,
    ethExecutionStrategy,
  };
};

export const timedFundingRoundSetup = async () => {
  const config = await fundingHouseSetup();

  const timedFundingRoundFactory = new TimedFundingRound__factory(config.deployer);
  const timedFundingRoundL2Factory = await starknet.getContractFactory(
    './contracts/starknet/rounds/timed_funding_round/timed_funding_round.cairo',
  );

  const timedFundingRoundEthTxAuthStrategyFactory = await starknet.getContractFactory(
    './contracts/starknet/rounds/timed_funding_round/auth/eth_tx.cairo',
  );
  const timedFundingRoundEthSigAuthStrategyFactory = await starknet.getContractFactory(
    './contracts/starknet/rounds/timed_funding_round/auth/eth_sig.cairo',
  );

  await config.starknetSigner.declare(timedFundingRoundL2Factory);
  await config.starknetSigner.declare(timedFundingRoundEthTxAuthStrategyFactory);
  await config.starknetSigner.declare(timedFundingRoundEthSigAuthStrategyFactory);

  const timedFundingRoundEthTxAuthStrategy = await config.starknetSigner.deploy(
    timedFundingRoundEthTxAuthStrategyFactory,
    {
      starknet_commit_address: config.starknetCommit.address,
    },
  );
  // prettier-ignore
  const timedFundingRoundEthSigAuthStrategy = await config.starknetSigner.deploy(
    timedFundingRoundEthSigAuthStrategyFactory,
  );

  const timedFundingRoundClassHash = await config.starknetSigner.declare(
    timedFundingRoundL2Factory,
    {
      constants: {
        voting_strategy_registry: config.votingStrategyRegistry.address,
        eth_execution_strategy: config.ethExecutionStrategy.address,
        eth_tx_auth_strategy: timedFundingRoundEthTxAuthStrategy.address,
        eth_sig_auth_strategy: timedFundingRoundEthSigAuthStrategy.address,
      },
    },
  );

  const timedFundingRoundImpl = await timedFundingRoundFactory.deploy(
    timedFundingRoundClassHash,
    config.propHouse.address,
    config.mockStarknetMessaging.address,
    config.messenger.address,
    constants.AddressZero,
    config.roundFactory.address,
    config.ethExecutionStrategy.address,
  );

  await config.manager.registerRound(
    config.fundingHouseImpl.address,
    timedFundingRoundImpl.address,
  );

  return {
    ...config,
    timedFundingRoundImpl,
    timedFundingRoundL2Factory,
    timedFundingRoundClassHash,
    timedFundingRoundEthTxAuthStrategy,
    timedFundingRoundEthSigAuthStrategy,
  };
};
