import { StarknetContractFactory } from 'starknet-hardhat-plugin-extended/dist/src/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { utils } from 'ethers';

const getStarknetArtifactPath = (contract: string, ext: 'sierra' | 'casm') =>
  `./contracts/starknet/target/dev/prop_house_${contract}.${ext}.json`;
const getSierraPath = (contract: string) => getStarknetArtifactPath(contract, 'sierra');
const getCasmPath = (contract: string) => getStarknetArtifactPath(contract, 'casm');

export const getStarknetFactory = (hre: HardhatRuntimeEnvironment, contractName: string) => {
  const metadata = {
    sierra: getSierraPath(contractName),
    casm: getCasmPath(contractName),
  };
  return new StarknetContractFactory({
    hre,
    abiPath: metadata.sierra,
    metadataPath: metadata.sierra,
    casmPath: metadata.casm,
  });
};

export const asciiToHex = (s: string) => utils.hexlify(utils.toUtf8Bytes(s));
