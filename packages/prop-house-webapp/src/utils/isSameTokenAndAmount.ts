import { Asset, AssetType, ERC1155, ERC20, ERC721, ETH } from '@prophouse/sdk-react';

/**
 * Checks that `a` array and `b` have the same assets and amounts
 */
export const isSameTokenAndAmount = (a: Asset[], b: Asset[]) =>
  a.some((asset, index) => {
    const assetWithMetadata = b[index];
    if (!assetWithMetadata) return false;

    if (asset.assetType !== assetWithMetadata.assetType) return true;

    if (asset.assetType === AssetType.ETH) {
      let eth = assetWithMetadata as ETH;
      if (asset.amount !== eth.amount) return true;
    }

    if (asset.assetType === AssetType.ERC721) {
      const erc721 = assetWithMetadata as ERC721;
      if (asset.address !== erc721.address) return true;
      if (asset.tokenId !== erc721.tokenId) return true;
    }

    if (asset.assetType === AssetType.ERC1155) {
      const erc1155 = assetWithMetadata as ERC1155;
      if (asset.address !== erc1155.address) return true;
      if (asset.tokenId !== erc1155.tokenId) return true;
      if (asset.amount !== erc1155.amount) return true;
    }

    if (asset.assetType === AssetType.ERC20) {
      let erc20 = assetWithMetadata as ERC20;
      if (asset.address !== erc20.address) return true;
      if (asset.amount !== erc20.amount) return true;
    }

    return false;
  });
