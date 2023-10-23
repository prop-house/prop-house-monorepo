import { useContractRead } from 'wagmi';
import { addressTypeABI } from './contractABIs';

// TODO - automatically detect network
// !Mainnet
// const contractAddress = '0x905429be6e2e07b6a7df6b2acd7806090a8e8915';
// !Goerli
const contractAddress = '0xbA17ADA91737eE7530CA846183611c70B63bfB2c';

const functionName = 'getType';

export default function useAddressType(address: string) {
  const { data, isLoading, isError } = useContractRead({
    address: contractAddress,
    abi: addressTypeABI,
    functionName,
    args: [address as `0x${string}`],
  });

  return { data, isLoading, isError };
}
