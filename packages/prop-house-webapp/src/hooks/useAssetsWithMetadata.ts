import { Asset, AssetType } from '@prophouse/sdk-react';
import { erc20ABI, erc721ABI } from '@wagmi/core';
import { formatEther } from 'viem';
import { useEffect, useState } from 'react';
import { formatUnits } from 'ethers/lib/utils';
import { useContractReads } from 'wagmi';
import useAssetImages from './useAssetImages';
import { isSameTokenAndAmount } from '../utils/isSameTokenAndAmount';

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

  // fetch decimals
  const { data: decimals, isLoading: isLoadingDecimals } = useContractReads({
    contracts: [
      ...onlyErc20Contracts.map(contract => {
        return { ...contract, functionName: 'decimals' };
      }),
    ],
  });

  // parse symbols, decimals and amounts into AssetWithMetadata
  useEffect(() => {
    const shoudUpdate = !assetsWithMetadata || isSameTokenAndAmount(assets, assetsWithMetadata);
    if (!shoudUpdate || !symbols || !decimals || !tokenImgs) return;

    const assetSymbols = assets.map(asset => {
      const indexToUse = nonEthContracts.findIndex(
        c => asset.assetType !== AssetType.ETH && c.address === asset.address,
      );
      return asset.assetType === AssetType.ETH ? 'ETH' : (symbols[indexToUse].result as string);
    });

    const assetDecimals = assets.map(asset => {
      const indexToUse = onlyErc20Contracts.findIndex(
        c => asset.assetType === AssetType.ERC20 && c.address === asset.address,
      );
      return asset.assetType === AssetType.ETH
        ? 18
        : asset.assetType === AssetType.ERC20
        ? (decimals[indexToUse].result as number)
        : 1;
    });

    const parsedAmounts = assets.map((asset, index) => {
      switch (asset.assetType) {
        case AssetType.ETH:
          return Number(formatEther(BigInt(asset.amount.toString())));
        case AssetType.ERC20:
          return Number(formatUnits(BigInt(asset.amount.toString()), assetDecimals[index]));
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
        decimals: assetDecimals[index],
        parsedAmount: parsedAmounts[index],
        tokenImg: tokenImgs[index],
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
    if (!tokenImgs || !assetsWithMetadata) return;
    const updated = assetsWithMetadata.map((asset, index) => {
      return {
        ...asset,
        tokenImg: tokenImgs[index],
      };
    });
    setAssetsWithMetadata(updated);
  }, [tokenImgs, assetsWithMetadata]);

  return [isLoadingSymbols || isLoadingDecimals, assetsWithMetadata];
};

export default useAssetsWithMetadata;
