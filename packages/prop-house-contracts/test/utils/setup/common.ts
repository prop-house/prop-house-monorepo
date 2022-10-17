import { ethers } from 'hardhat';

export const commonL1Setup = async () => {
  const registrarManagerFactory = await ethers.getContractFactory('RegistrarManager');
  const deploymentManagerFactory = await ethers.getContractFactory('DeploymentManager');
  const upgradeManagerFactory = await ethers.getContractFactory('UpgradeManager');
  const strategyManagerFactory = await ethers.getContractFactory('StrategyManager');

  const houseDeployerFactory = await ethers.getContractFactory('HouseFactory');

  const mockStarknetMessagingFactory = await ethers.getContractFactory('MockStarknetMessaging');
  const starknetCommitFactory = await ethers.getContractFactory('StarkNetCommit');
  const starknetMessengerFactory = await ethers.getContractFactory('StarknetMessenger');

  const [registrar] = await ethers.getSigners();

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
