import {
  Manager__factory,
  Messenger__factory,
  MockStarknetMessaging__factory,
  CreatorPassRegistry__factory,
  PropHouse__factory,
  StarkNetCommit__factory,
} from '../../../typechain';
import { ethers } from 'hardhat';
import { constants } from 'ethers';

export const commonL1Setup = async () => {
  const [deployer] = await ethers.getSigners();

  const managerFactory = new Manager__factory(deployer);
  const propHouseFactory = new PropHouse__factory(deployer);
  const creatorPassRegistryFactory = new CreatorPassRegistry__factory(deployer);

  const mockStarknetMessagingFactory = new MockStarknetMessaging__factory(deployer);
  const starknetCommitFactory = new StarkNetCommit__factory(deployer);
  const messengerFactory = new Messenger__factory(deployer);

  const manager = await managerFactory.deploy();
  const [propHouse, mockStarknetMessaging] = await Promise.all([
    propHouseFactory.deploy(manager.address),
    mockStarknetMessagingFactory.deploy(),
  ]);

  const [creatorPassRegistry, starknetCommit] = await Promise.all([
    creatorPassRegistryFactory.deploy(propHouse.address, constants.AddressZero),
    starknetCommitFactory.deploy(mockStarknetMessaging.address),
  ]);
  const messenger = await messengerFactory.deploy(mockStarknetMessaging.address, propHouse.address);

  return {
    deployer,
    manager,
    propHouse,
    creatorPassRegistry,
    messenger,
    mockStarknetMessaging,
    starknetCommit,
  };
};
