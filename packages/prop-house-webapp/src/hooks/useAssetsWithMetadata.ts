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

  // parse symbols and amounts into AssetWithMetadata
  useEffect(() => {
    const shoudUpdate = !assetsWithMetadata || isSameTokenAndAmount(assets, assetsWithMetadata);
    if (!shoudUpdate || !symbols || !decimals || !tokenImgs || !decimals) return;

    const parsedAmounts = assets.map((asset, index) => {
      switch (asset.assetType) {
        case AssetType.ETH:
          return Number(formatEther(BigInt(asset.amount.toString())));
        case AssetType.ERC20:
          return Number(formatUnits(BigInt(asset.amount.toString())));
        // return Number(formatUnits(BigInt(asset.amount.toString()), assetDecimals[index]));
        case AssetType.ERC721:
        case AssetType.ERC1155:
        default:
          return 1;
      }
    });

    const result = assets.map((asset, index) => {
      return {
        ...asset,
        symbol: symbols[index],
        parsedAmount: parsedAmounts[index],
        tokenImg: tokenImgs[index],
        decimals: decimals[index],
      };
    });

    setAssetsWithMetadata(result);
  }, [assets, symbols, decimals, assetsWithMetadata, tokenImgs]);

  // update token images
  useEffect(() => {
    const shouldUpdate =
      assetsWithMetadata &&
      tokenImgs &&
      assetsWithMetadata.some((a, i) => a.tokenImg !== tokenImgs[i]);

    if (!shouldUpdate) return;

    const updated = assetsWithMetadata.map((asset, index) => {
      return {
        ...asset,
        tokenImg: tokenImgs[index],
      };
    });
    setAssetsWithMetadata(updated);
  }, [tokenImgs]);

  // update decimals
  useEffect(() => {
    const shouldUpdate =
      assetsWithMetadata &&
      decimals &&
      assetsWithMetadata.some((a, i) => a.decimals !== decimals[i]);

    if (!shouldUpdate) return;

    const updated = assetsWithMetadata.map((asset, index) => {
      return {
        ...asset,
        decimals: decimals[index],
      };
    });
    setAssetsWithMetadata(updated);
  }, [decimals]);

  // update symbols
  useEffect(() => {
    const shouldUpdate =
      assetsWithMetadata && symbols && assetsWithMetadata.some((a, i) => a.symbol !== symbols[i]);

    if (!shouldUpdate) return;

    const updated = assetsWithMetadata.map((asset, index) => {
      return {
        ...asset,
        symbol: symbols[index],
      };
    });
    setAssetsWithMetadata(updated);
  }, [symbols]);

  return [false, assetsWithMetadata];
};

export default useAssetsWithMetadata;
