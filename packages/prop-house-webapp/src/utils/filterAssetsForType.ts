import { Asset, AssetType } from '@prophouse/sdk-react';

export const filterAssetsForType = <T extends Asset>(assets: Asset[], type: AssetType): T[] => {
  return assets.reduce((acc, asset) => {
    if (asset.assetType === type) {
      acc.push(asset as T);
    }
    return acc;
  }, [] as T[]);
};
