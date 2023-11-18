import { Asset, AssetType, ERC20 } from '@prophouse/sdk-react';
import { erc20ABI } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { useContractReads } from 'wagmi';

/**
 * Returns decimals for ERC20s by calling corresponding contracts along with expected ETH/721/1155 decimals
 */
const useAssetDecimals = (assets: Asset[]): number[] | undefined => {
  const [decimals, setDecimals] = useState<number[]>();

  const erc20Assets = assets.filter(a => a.assetType === AssetType.ERC20) as ERC20[];
  const contracts = erc20Assets.reduce((acc, asset) => {
    acc.push({
      address: asset.address as `0x${string}`,
      abi: erc20ABI,
    });
    return acc;
  }, [] as Array<{ address: `0x${string}`; abi: any }>);

  // fetch decimals
  const { data: _decimals, isLoading: isLoadingDecimals } = useContractReads({
    contracts: [
      ...contracts.map(contract => {
        return { ...contract, functionName: 'decimals' };
      }),
    ],
  });

  // parse decimals
  useEffect(() => {
    if (!_decimals || isLoadingDecimals) return;

    const fetchedDecimals = _decimals.map(decimal => decimal.result as number);

    const mappedDecimals = assets.map(asset => {
      const indexToUse = erc20Assets.findIndex(
        c => asset.assetType !== AssetType.ETH && c.address === asset.address,
      );
      return asset.assetType === AssetType.ERC20
        ? fetchedDecimals[indexToUse]
        : asset.assetType === AssetType.ETH
        ? 18
        : 0;
    });

    const shouldUpdate =
      decimals === undefined || decimals.some((aD, i) => aD !== mappedDecimals[i]);

    if (shouldUpdate) setDecimals(mappedDecimals);
  }, [assets]);

  return decimals;
};

export default useAssetDecimals;
