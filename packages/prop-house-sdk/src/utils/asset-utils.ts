import { BigNumberish } from '@ethersproject/bignumber';
import { pack } from '@ethersproject/solidity';
import { keccak256 } from '@ethersproject/keccak256';
import { IAssetData__factory } from '@prophouse/contracts';

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
   * Generate an ETH asset ID
   */
  getETHAssetID(): string {
    return this.encodeETHAssetData();
  },

  /**
   * Generate an ERC20 asset ID
   * @param tokenAddress The ERC20 token address
   */
  getERC20AssetID(tokenAddress: string): string {
    return this.encodeERC20AssetData(tokenAddress);
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
