import { Asset, AssetType, ERC20 } from '@prophouse/sdk-react';
import { erc20ABI, erc721ABI } from '@wagmi/core';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';
import { formatUnits } from 'ethers/lib/utils';
import { useContractReads } from 'wagmi';
import useAssetImages from './useAssetImages';
import { isSameTokenAndAmount } from '../utils/isSameTokenAndAmount';
import useAssetDecimals from './useAssetsWithDecimals';

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

  // filter out ETH assets
  const nonEthContracts = assets.reduce((acc, asset) => {
    if (asset.assetType !== AssetType.ETH) {
      acc.push({
        address: asset.address as `0x${string}`,
        abi: asset.assetType === AssetType.ERC20 ? erc20ABI : erc721ABI,
      });
    }
    return acc;
  }, [] as Array<{ address: `0x${string}`; abi: any }>);

  const onlyErc20Contracts = nonEthContracts.filter(contract => contract.abi === erc20ABI);

  // fetch symbols
  const { data: symbols, isLoading: isLoadingSymbols } = useContractReads({
    contracts: [
      ...nonEthContracts.map(contract => {
        return { ...contract, functionName: 'symbol' };
      }),
    ],
  });

  // parse symbols and amounts into AssetWithMetadata
  useEffect(() => {
    const shoudUpdate = !assetsWithMetadata || isSameTokenAndAmount(assets, assetsWithMetadata);
    if (!shoudUpdate || !symbols || !decimals || !tokenImgs || !decimals) return;

    const assetSymbols = assets.map(asset => {
      const indexToUse = nonEthContracts.findIndex(
        c => asset.assetType !== AssetType.ETH && c.address === asset.address,
      );
      return asset.assetType === AssetType.ETH ? 'ETH' : (symbols[indexToUse].result as string);
    });

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
        symbol: assetSymbols[index],
        parsedAmount: parsedAmounts[index],
        tokenImg: tokenImgs[index],
        decimals: decimals[index],
      };
    });

    setAssetsWithMetadata(result);
  }, [
    assets,
    symbols,
    decimals,
    nonEthContracts,
    onlyErc20Contracts,
    assetsWithMetadata,
    tokenImgs,
  ]);

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
    console.log('useef');
    console.log(updated);
    setAssetsWithMetadata(updated);
  }, [decimals]);

  return [isLoadingSymbols, assetsWithMetadata];
};

export default useAssetsWithMetadata;
