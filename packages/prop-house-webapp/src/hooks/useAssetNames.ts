import { Asset, AssetType } from '@prophouse/sdk-react';
import { erc20ABI } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { useContractReads } from 'wagmi';

/**
 * Returns names for assets provided
 */
const useAssetNames = (assets: Asset[]): string[] | undefined => {
  const [names, setNames] = useState<string[]>();

  // filter out ETH assets (name is known)
  const nonEthContracts = assets.reduce((acc, asset) => {
    if (asset.assetType !== AssetType.ETH) {
      acc.push({
        address: asset.address as `0x${string}`,
        abi: erc20ABI,
      });
    }
    return acc;
  }, [] as Array<{ address: `0x${string}`; abi: any }>);

  // fetch names
  const { data: fetchedNames, isLoading: loadingNames } = useContractReads({
    contracts: [
      ...nonEthContracts.map(contract => {
        return { ...contract, functionName: 'name' };
      }),
    ],
  });

  useEffect(() => {
    if (!fetchedNames || loadingNames) return;

    const _names = fetchedNames.map(name => name.result as string);
    const updatedNames = assets.map(asset => {
      const indexToUse = nonEthContracts.findIndex(
        c => asset.assetType !== AssetType.ETH && c.address === asset.address,
      );
      return asset.assetType === AssetType.ETH
        ? 'ETH'
        : _names[indexToUse]
        ? _names[indexToUse]
        : '';
    });

    const shouldUpdate = names === undefined || names.some((n, i) => n !== updatedNames[i]);

    if (shouldUpdate) setNames(updatedNames);
  }, [assets, fetchedNames, loadingNames, names, nonEthContracts]);

  return names;
};

export default useAssetNames;
