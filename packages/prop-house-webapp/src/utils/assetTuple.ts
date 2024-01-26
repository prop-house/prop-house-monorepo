import { Asset, AssetType } from '@prophouse/sdk-react';

// Generates tuple for asset as [assetType, asset.address, asset.tokenId, asset.amount]
export const assetTuple = (asset: Asset): [number, string, bigint, bigint] => {
  switch (asset.assetType) {
    case AssetType.ETH:
      return [
        0,
        '0x0000000000000000000000000000000000000000',
        BigInt(0),
        BigInt(asset.amount.toString()),
      ];
    case AssetType.ERC20:
      return [1, asset.address, BigInt(0), BigInt(asset.amount.toString())];
    case AssetType.ERC721:
      return [2, asset.address, BigInt(asset.tokenId.toString()), BigInt(1)];
    case AssetType.ERC1155:
      return [3, asset.address, BigInt(asset.tokenId.toString()), BigInt(asset.amount.toString())];
  }
};
