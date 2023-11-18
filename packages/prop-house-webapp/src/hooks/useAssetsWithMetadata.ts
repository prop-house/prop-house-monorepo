import { Asset, AssetType, ERC20 } from '@prophouse/sdk-react';
import { erc20ABI, erc721ABI } from '@wagmi/core';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';
import { formatUnits } from 'ethers/lib/utils';
import { useContractReads } from 'wagmi';
import useAssetImages from './useAssetImages';
import { isSameTokenAndAmount } from '../utils/isSameTokenAndAmount';
import useAssetDecimals from './useAssetsWithDecimals';
import useAssetSymbols from './useAssetSymbols';

interface AssetMetadata {
  symbol: string;
  decimals: number | undefined;
  parsedAmount: number;
  tokenImg?: string;
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

  useEffect(() => {
    if (!symbols || !decimals || !tokenImgs) return;

    const parsedAmounts = assets.map((asset, index) => {
      switch (asset.assetType) {
        case AssetType.ETH:
          return Number(formatEther(BigInt(asset.amount.toString())));
        case AssetType.ERC20:
          return Number(formatUnits(BigInt(asset.amount.toString()), decimals[index]));
        case AssetType.ERC721:
        case AssetType.ERC1155:
        default:
          return 1;
      }
    });

    const updated = assets.map((asset, index) => {
      return {
        ...asset,
        symbol: symbols[index],
        parsedAmount: parsedAmounts[index],
        tokenImg: tokenImgs[index],
        decimals: decimals[index],
      };
    });

    const isAssetsWithMetadataSame = assetsWithMetadata?.every((asset, index) => {
      const updatedAsset = updated[index];
      return (
        asset.symbol === updatedAsset.symbol &&
        asset.decimals === updatedAsset.decimals &&
        asset.parsedAmount === updatedAsset.parsedAmount &&
        asset.tokenImg === updatedAsset.tokenImg
      );
    });

    if (!isAssetsWithMetadataSame) setAssetsWithMetadata(updated);
  }, [assets, tokenImgs, decimals, symbols]);

  return [false, assetsWithMetadata];
};

export default useAssetsWithMetadata;
