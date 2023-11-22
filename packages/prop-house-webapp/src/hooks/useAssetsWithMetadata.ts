import { Asset, AssetType } from '@prophouse/sdk-react';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';
import { formatUnits } from 'ethers/lib/utils';
import useAssetImages from './useAssetImages';
import useAssetDecimals from './useAssetsWithDecimals';
import useAssetSymbols from './useAssetSymbols';
import useAssetNames from './useAssetNames';

interface AssetMetadata {
  symbol: string;
  decimals: number | undefined;
  parsedAmount: number;
  tokenImg?: string;
  name: string;
}

export type AssetWithMetadata = Asset & AssetMetadata;

type UseAssetsWithMetadataResults = [
  /**
   * loading
   */
  boolean,
  AssetWithMetadata[] | undefined,
];
type UseAssetWithMetadataResult = [
  /**
   * loading
   */
  boolean,
  AssetWithMetadata | undefined,
];
export const useAssetWithMetadata = (asset: Asset): UseAssetWithMetadataResult => {
  const [loading, assets] = useAssetsWithMetadata([asset]);
  return [loading, assets ? assets[0] : undefined];
};

/**
 * Fetches symbols and decimals for each asset and returns AssetWithMetadata[]
 */
const useAssetsWithMetadata = (assets: Asset[]): UseAssetsWithMetadataResults => {
  const [assetsWithMetadata, setAssetsWithMetadata] = useState<AssetWithMetadata[] | undefined>();

  const tokenImgs = useAssetImages(assets);
  const decimals = useAssetDecimals(assets);
  const symbols = useAssetSymbols(assets);
  const names = useAssetNames(assets);

  useEffect(() => {
    if (!symbols || !decimals || !tokenImgs || !names) return;

    const parsedAmounts = assets.map((asset, index) => {
      switch (asset.assetType) {
        case AssetType.ETH:
          return Number(formatEther(BigInt(asset.amount.toString())));
        case AssetType.ERC20:
          return Number(formatUnits(BigInt(asset.amount.toString()), decimals[index]));
        case AssetType.ERC721:
          return 1;
        case AssetType.ERC1155:
          return Number(asset.amount.toString());
      }
    });

    const updated = assets.map((asset, index) => {
      return {
        ...asset,
        symbol: symbols[index],
        parsedAmount: parsedAmounts[index],
        tokenImg: tokenImgs[index],
        decimals: decimals[index],
        name: names[index],
      };
    });

    const isAssetsWithMetadataSame = assetsWithMetadata?.every((asset, index) => {
      const updatedAsset = updated[index];
      return (
        asset.symbol === updatedAsset.symbol &&
          asset.decimals === updatedAsset.decimals &&
          asset.parsedAmount === updatedAsset.parsedAmount &&
          asset.tokenImg === updatedAsset.tokenImg,
        asset.name === updatedAsset.name
      );
    });

    if (!isAssetsWithMetadataSame) setAssetsWithMetadata(updated);
  }, [assets, tokenImgs, decimals, symbols, names]);

  return [false, assetsWithMetadata];
};

export default useAssetsWithMetadata;
