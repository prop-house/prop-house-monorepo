import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { BytesLike, concat, hexlify } from '@ethersproject/bytes';
import { AddressZero, HashZero, One, Zero } from '@ethersproject/constants';
import { Asset, AssetType, AssetStruct } from '../../types';
import { pack, keccak256 } from '@ethersproject/solidity';
import { isAddress } from '@ethersproject/address';

/**
 * Convert `bytes` to a `bytes32` hex string
 * @param bytes The bytes to convert
 * @param truncate Whether bytes should be truncated if over 32 bytes
 */
export const toBytes32 = (bytes: BytesLike, truncate = true) => {
  if (!truncate && bytes.length > 32) {
    throw new Error('bytes32 string must be less than 32 bytes');
  }
  return hexlify(concat([bytes, HashZero]).slice(0, 32));
};

/**
 * Return an asset struct for the provided `asset`
 * @param asset The asset information
 */
export const getAssetStruct = (asset: Asset): AssetStruct => {
  switch (asset.assetType) {
    case AssetType.ETH:
      return {
        assetType: asset.assetType,
        token: AddressZero,
        identifier: Zero,
        amount: asset.amount,
      };
    case AssetType.ERC20:
      return {
        assetType: asset.assetType,
        token: asset.address,
        identifier: Zero,
        amount: asset.amount,
      };
    case AssetType.ERC721:
      return {
        assetType: asset.assetType,
        token: asset.address,
        identifier: asset.tokenId,
        amount: One,
      };
    case AssetType.ERC1155:
      return {
        assetType: asset.assetType,
        token: asset.address,
        identifier: asset.tokenId,
        amount: asset.amount,
      };
    default:
      throw new Error(`Unknown asset: ${JSON.stringify(asset)}`);
  }
};

/**
 * Return compressed asset and amount information for the provided `assets`
 * @param assets The asset information
 */
export const compressAssets = (assets: Asset[]) => {
  return assets.map(asset => [
    getAssetID(asset),
    asset.assetType === AssetType.ERC721 ? 1 : asset.amount,
  ]);
};

/**
 * Generate an asset ID for the provided `asset`
 * @param asset The asset information
 */
export const getAssetID = (asset: Asset): string => {
  switch (asset.assetType) {
    case AssetType.ETH:
      return getETHAssetID();
    case AssetType.ERC20:
      return getERC20AssetID(asset.address);
    case AssetType.ERC721:
      return getERC721AssetID(asset.address, asset.tokenId);
    case AssetType.ERC1155:
      return getERC1155AssetID(asset.address, asset.tokenId);
    default:
      throw new Error(`Unknown asset: ${JSON.stringify(asset)}`);
  }
};

/**
 * Generate an ETH asset ID
 */
export const getETHAssetID = (): string => {
  return toBytes32(BigNumber.from(AssetType.ETH).toHexString());
};

/**
 * Generate an ERC20 asset ID
 * @param tokenAddress The ERC20 token address
 */
export const getERC20AssetID = (tokenAddress: string): string => {
  if (!isAddress(tokenAddress)) {
    throw new Error(`Invalid ERC-20 token address: ${tokenAddress}`);
  }
  return toBytes32(pack(['uint8', 'address'], [AssetType.ERC20, tokenAddress]));
};

/**
 * Generate an ERC721 asset ID
 * @param tokenAddress The ERC721 token address
 * @param tokenId The ERC721 token ID
 */
export const getERC721AssetID = (tokenAddress: string, tokenId: BigNumberish): string => {
  if (!isAddress(tokenAddress)) {
    throw new Error(`Invalid ERC-721 token address: ${tokenAddress}`);
  }
  return toBytes32(
    pack(
      ['uint8', 'bytes32'],
      [AssetType.ERC721, keccak256(['address', 'uint256'], [tokenAddress, tokenId])],
    ),
  );
};

/**
 * Generate an ERC1155 asset ID
 * @param tokenAddress The ERC1155 token address
 * @param tokenId The ERC1155 token ID
 */
export const getERC1155AssetID = (tokenAddress: string, tokenId: BigNumberish): string => {
  if (!isAddress(tokenAddress)) {
    throw new Error(`Invalid ERC-1155 token address: ${tokenAddress}`);
  }
  return toBytes32(
    pack(
      ['uint8', 'bytes32'],
      [AssetType.ERC1155, keccak256(['address', 'uint256'], [tokenAddress, tokenId])],
    ),
  );
};
