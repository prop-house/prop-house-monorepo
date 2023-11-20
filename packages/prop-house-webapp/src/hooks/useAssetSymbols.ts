import { Asset, AssetType } from '@prophouse/sdk-react';
import { erc20ABI } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { useContractReads } from 'wagmi';

export const useSingleAssetSymbol = (asset: Asset): string | undefined => {
  const symbol = useAssetSymbols([asset]);
  return symbol ? symbol[0] : undefined;
};

/**
 * Returns symbols for assets provided
 */
const useAssetSymbols = (assets: Asset[]): string[] | undefined => {
  const [symbols, setSymbols] = useState<string[]>();

  // filter out ETH assets (symbol is known)
  const nonEthContracts = assets.reduce((acc, asset) => {
    if (asset.assetType !== AssetType.ETH) {
      acc.push({
        address: asset.address as `0x${string}`,
        abi: erc20ABI,
      });
    }
    return acc;
  }, [] as Array<{ address: `0x${string}`; abi: any }>);

  // fetch symbols
  const { data: fetchedSymbols, isLoading: isLoadingSymbols } = useContractReads({
    contracts: [
      ...nonEthContracts.map(contract => {
        return { ...contract, functionName: 'symbol' };
      }),
    ],
  });

  useEffect(() => {
    if (!fetchedSymbols || isLoadingSymbols) return;

    const _symbols = fetchedSymbols.map(decimal => decimal.result as string);

    const mappedSymbols = assets.map(asset => {
      const indexToUse = nonEthContracts.findIndex(
        c => asset.assetType !== AssetType.ETH && c.address === asset.address,
      );
      return asset.assetType === AssetType.ETH ? 'ETH' : _symbols[indexToUse];
    });

    const shouldUpdate = symbols === undefined || symbols.some((aD, i) => aD !== mappedSymbols[i]);

    if (shouldUpdate) setSymbols(mappedSymbols);
  }, [assets]);

  return symbols;
};

export default useAssetSymbols;
