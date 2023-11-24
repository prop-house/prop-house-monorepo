import { AssetType } from '@prophouse/sdk-react';

export const assetTypeString = (assetType: AssetType): string => {
  switch (assetType) {
    case AssetType.ETH:
      return 'ETH';
    case AssetType.ERC20:
      return 'ERC-20';
    case AssetType.ERC721:
      return 'ERC-721';
    case AssetType.ERC1155:
      return 'ERC-1155';
  }
};
