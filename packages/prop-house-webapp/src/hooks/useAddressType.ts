import { Address, useChainId, useContractRead } from 'wagmi';
import { addressTypeABI } from '../utils/contractABIs';
import { ChainId } from '@prophouse/sdk-react';

const TYPE_FETCHER_CONTRACTS: Record<number, Address> = {
  [ChainId.EthereumMainnet]: '0x905429be6e2e07b6a7df6b2acd7806090a8e8915',
  [ChainId.EthereumGoerli]: '0xbA17ADA91737eE7530CA846183611c70B63bfB2c',
};
const FUNCTION_NAME = 'getType';

export default function useAddressType(address: string) {
  const chainId = useChainId();
  const { data, isLoading, isError } = useContractRead({
    address: TYPE_FETCHER_CONTRACTS[chainId],
    abi: addressTypeABI,
    functionName: FUNCTION_NAME,
    args: [address as `0x${string}`],
    chainId: chainId,
  });

  return { data, isLoading, isError };
}
