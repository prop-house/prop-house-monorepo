import { erc20ABI } from '@wagmi/core';
import { useContractReads } from 'wagmi';

/**
 * Returns decimals for ERC20s by calling corresponding contracts
 */
const useErc20AddressDecimals = (addresses: string[]): number[] | undefined => {
  const contracts = addresses.map(address => {
    return {
      address: address as `0x${string}`,
      abi: erc20ABI,
    };
  }, [] as Array<{ address: `0x${string}`; abi: any }>);

  // fetch decimals
  const { data: decimals } = useContractReads({
    contracts: [
      ...contracts.map(contract => {
        return { ...contract, functionName: 'decimals' };
      }),
    ],
  });

  return decimals?.map(decimal => decimal.result as number);
};

export default useErc20AddressDecimals;
