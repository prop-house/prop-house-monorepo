import { useContractRead } from 'wagmi';
import { decimalsABI } from './contractABIs';

// Get decimals number from contract

const functionName = 'decimals';

// TODO: Getting a lot of `undefined` decimals, but i think it's because we're on Goerli
// TODO: Need to test on mainnet
export default function useGetDecimals(erc20Address: string) {
  const { data, isLoading, isError } = useContractRead({
    address: erc20Address,
    abi: decimalsABI,
    functionName,
  });

  return { data, isLoading, isError };
}
