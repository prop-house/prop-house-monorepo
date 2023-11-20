import { ERC20 } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { getFunctionSelector, isAddress } from 'viem';

const useIsValidErc20 = (asset: ERC20): boolean | undefined => {
  const [isValid, setIsValid] = useState<boolean>();

  const client = usePublicClient();
  const functions = [
    'totalSupply()',
    'balanceOf(address)',
    'transfer(address, uint256)',
    'transferFrom(address, address, uint256)',
    'approve(address, uint256)',
  ];

  useEffect(() => {
    if (!asset.address || !isAddress(asset.address)) return;
    const getByteCode = async () => {
      try {
        const selectors = functions.map(getFunctionSelector).map(e => e.slice(2));
        const bytecode = await client.getBytecode({
          address: asset.address as `0x${string}`,
        });

        if (bytecode === '0x' || !bytecode) setIsValid(false);

        const containsSelectors = selectors.every(selector => bytecode?.includes(selector));
        setIsValid(containsSelectors);
      } catch (e) {
        console.log('error', e);
        setIsValid(false);
      }
    };
    getByteCode();
  }, [asset]);

  return isValid;
};

export default useIsValidErc20;
