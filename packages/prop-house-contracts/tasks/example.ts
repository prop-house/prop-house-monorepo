import { HardhatRuntimeEnvironment } from 'hardhat/types/runtime';

export const example = async (_: unknown, hre: HardhatRuntimeEnvironment): Promise<void> => {
  const ethers = hre.ethers;

  const [account] = await ethers.getSigners();

  console.log(
    `Balance for 1st account ${await account.getAddress()}: ${await account.getBalance()}`,
  );
};
