import { BigNumberish } from '@ethersproject/bignumber';
import { IAssetData__factory } from '@prophouse/contracts';
import { BytesLike, concat, hexlify } from '@ethersproject/bytes';
import { HashZero } from '@ethersproject/constants';
import { keccak256 } from '@ethersproject/keccak256';
import { pack } from '@ethersproject/solidity';

export const assetUtils = {
  assetDataIface: IAssetData__factory.createInterface(),

  /**
   * Encode ETH asset data
   */
  encodeETHAssetData(): string {
    return this.assetDataIface.encodeFunctionData('ETH');
  },

  /**
   * Encode ERC20 asset data
   * @param tokenAddress The ERC20 token address
   */
  encodeERC20AssetData(tokenAddress: string): string {
    return pack(
      ['bytes4', 'address'],
      [
        this.assetDataIface.getSighash(this.assetDataIface.functions['ERC20Token(address)']),
        tokenAddress,
      ],
    );
  },

  /**
   * Encode ERC721 asset data
   * @param tokenAddress The ERC721 token address
   * @param tokenId The ERC721 token ID
   */
  encodeERC721AssetData(tokenAddress: string, tokenId: BigNumberish): string {
    return pack(
      ['bytes4', 'address', 'uint256'],
      [
        this.assetDataIface.getSighash(
          this.assetDataIface.functions['ERC721Token(address,uint256)'],
        ),
        tokenAddress,
        tokenId,
      ],
    );
  },

  /**
   * Encode ERC1155 asset data
   * @param tokenAddress The ERC1155 token address
   * @param tokenId The ERC1155 token ID
   */
  encodeERC1155AssetData(tokenAddress: string, tokenId: BigNumberish): string {
    return pack(
      ['bytes4', 'address', 'uint256'],
      [
        this.assetDataIface.getSighash(
          this.assetDataIface.functions['ERC1155Token(address,uint256)'],
        ),
        tokenAddress,
        tokenId,
      ],
    );
  },

  /**
   * Convert `bytes` to a `bytes32` hex string
   * @param bytes The bytes to convert
   */
  toBytes32(bytes: BytesLike) {
    // Ensure we have room for null-termination
    if (bytes.length > 31) {
      throw new Error('bytes32 string must be less than 32 bytes');
    }
    return hexlify(concat([bytes, HashZero]).slice(0, 32));
  },

  /**
   * Generate an ETH asset ID
   */
  getETHAssetID(): string {
    return this.toBytes32(this.encodeETHAssetData());
  },

  /**
   * Generate an ERC20 asset ID
   * @param tokenAddress The ERC20 token address
   */
  getERC20AssetID(tokenAddress: string): string {
    return this.toBytes32(this.encodeERC20AssetData(tokenAddress));
  },

  /**
   * Generate an ERC721 asset ID
   * @param tokenAddress The ERC721 token address
   * @param tokenId The ERC721 token ID
   */
  getERC721AssetID(tokenAddress: string, tokenId: BigNumberish): string {
    return keccak256(this.encodeERC721AssetData(tokenAddress, tokenId));
  },

  /**
   * Generate an ERC1155 asset ID
   * @param tokenAddress The ERC1155 token address
   * @param tokenId The ERC1155 token ID
   */
  getERC1155AssetID(tokenAddress: string, tokenId: BigNumberish): string {
    return keccak256(this.encodeERC1155AssetData(tokenAddress, tokenId));
  },
};
