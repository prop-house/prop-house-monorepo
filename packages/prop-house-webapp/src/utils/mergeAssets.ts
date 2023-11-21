import { Asset, AssetType } from '@prophouse/sdk-react';

/**
 * Takes an array of type Asset and merges assets of the same kind depending on type
 */
export const mergeAssets = (assets: Asset[]): Asset[] => {
  const mergedAssets: Asset[] = [];

  assets.forEach(asset => {
    const existingAsset = mergedAssets.find(a => {
      if (asset.assetType === AssetType.ETH) return a.assetType === AssetType.ETH;
      if (asset.assetType === AssetType.ERC20)
        return a.assetType === AssetType.ERC20 && a.address === asset.address;
      if (asset.assetType === AssetType.ERC1155)
        return (
          a.assetType === AssetType.ERC1155 &&
          a.address === asset.address &&
          a.tokenId === asset.tokenId
        );
      return false;
    });

    if (
      existingAsset &&
      asset.assetType !== AssetType.ERC721 &&
      existingAsset.assetType !== AssetType.ERC721
    ) {
      // merge asset
      existingAsset.amount =
        BigInt(existingAsset.amount.toString()) + BigInt(asset.amount.toString());
    } else {
      mergedAssets.push(asset);
    }
  });

  return mergedAssets;
};
