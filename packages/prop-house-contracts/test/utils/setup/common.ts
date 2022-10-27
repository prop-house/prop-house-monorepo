import {
  RegistrarManager__factory,
  DeploymentManager__factory,
  UpgradeManager__factory,
  StrategyManager__factory,
  HouseFactory__factory,
  MockStarknetMessaging__factory,
  StarkNetCommit__factory,
  StarknetMessenger__factory,
} from '../../../typechain';
import { ethers } from 'hardhat';

export const commonL1Setup = async () => {
  const [registrar] = await ethers.getSigners();

  const registrarManagerFactory = new RegistrarManager__factory(registrar);
  const deploymentManagerFactory = new DeploymentManager__factory(registrar);
  const upgradeManagerFactory = new UpgradeManager__factory(registrar);
  const strategyManagerFactory = new StrategyManager__factory(registrar);

  const houseDeployerFactory = new HouseFactory__factory(registrar);

  const mockStarknetMessagingFactory = new MockStarknetMessaging__factory(registrar);
  const starknetCommitFactory = new StarkNetCommit__factory(registrar);
  const starknetMessengerFactory = new StarknetMessenger__factory(registrar);

  const registrarManager = await registrarManagerFactory.deploy(registrar.address);
  const [deploymentManager, upgradeManager, strategyManager, mockStarknetMessaging] =
    await Promise.all([
      deploymentManagerFactory.deploy(registrarManager.address),
      upgradeManagerFactory.deploy(registrarManager.address),
      strategyManagerFactory.deploy(registrarManager.address),
      mockStarknetMessagingFactory.deploy(),
    ]);

  const houseFactory = await houseDeployerFactory.deploy(deploymentManager.address);
  const starknetCommit = await starknetCommitFactory.deploy(mockStarknetMessaging.address);
  const starknetMessenger = await starknetMessengerFactory.deploy(
    mockStarknetMessaging.address,
    houseFactory.address,
  );

  return {
    registrar,
    registrarManager,
    deploymentManager,
    upgradeManager,
    strategyManager,
    houseFactory,
    starknetMessenger,
    mockStarknetMessaging,
    starknetCommit,
  };
};
