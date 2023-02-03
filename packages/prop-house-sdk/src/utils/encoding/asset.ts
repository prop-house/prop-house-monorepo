// import { BigNumberish } from '@ethersproject/bignumber';
// import { IAssetData__factory } from '@prophouse/contracts';
// import { BytesLike, concat, hexlify } from '@ethersproject/bytes';
// import { HashZero } from '@ethersproject/constants';
// import { keccak256 } from '@ethersproject/keccak256';
// import { pack } from '@ethersproject/solidity';

// /**
//  * `IAssetData` contract interface
//  */
// export const assetDataInterface = IAssetData__factory.createInterface();

// /**
//  * Encode ETH asset data
//  */
// export const encodeETHAssetData = (): string => {
//   return assetDataInterface.encodeFunctionData('ETH');
// };

// /**
//  * Encode ERC20 asset data
//  * @param tokenAddress The ERC20 token address
//  */
// export const encodeERC20AssetData = (tokenAddress: string): string => {
//   return pack(
//     ['bytes4', 'address'],
//     [
//       assetDataInterface.getSighash(assetDataInterface.functions['ERC20Token(address)']),
//       tokenAddress,
//     ],
//   );
// };

// /**
//  * Encode ERC721 asset data
//  * @param tokenAddress The ERC721 token address
//  * @param tokenId The ERC721 token ID
//  */
// export const encodeERC721AssetData = (tokenAddress: string, tokenId: BigNumberish): string => {
//   return pack(
//     ['bytes4', 'address', 'uint256'],
//     [
//       assetDataInterface.getSighash(assetDataInterface.functions['ERC721Token(address,uint256)']),
//       tokenAddress,
//       tokenId,
//     ],
//   );
// };

// /**
//  * Encode ERC1155 asset data
//  * @param tokenAddress The ERC1155 token address
//  * @param tokenId The ERC1155 token ID
//  */
// export const encodeERC1155AssetData = (tokenAddress: string, tokenId: BigNumberish): string => {
//   return pack(
//     ['bytes4', 'address', 'uint256'],
//     [
//       assetDataInterface.getSighash(assetDataInterface.functions['ERC1155Token(address,uint256)']),
//       tokenAddress,
//       tokenId,
//     ],
//   );
// };

// /**
//  * Convert `bytes` to a `bytes32` hex string
//  * @param bytes The bytes to convert
//  */
// export const toBytes32 = (bytes: BytesLike) => {
//   // Ensure we have room for null-termination
//   if (bytes.length > 31) {
//     throw new Error('bytes32 string must be less than 32 bytes');
//   }
//   return hexlify(concat([bytes, HashZero]).slice(0, 32));
// };

// /**
//  * Generate an ETH asset ID
//  */
// export const getETHAssetID = (): string => {
//   return toBytes32(encodeETHAssetData());
// };

// /**
//  * Generate an ERC20 asset ID
//  * @param tokenAddress The ERC20 token address
//  */
// export const getERC20AssetID = (tokenAddress: string): string => {
//   return toBytes32(encodeERC20AssetData(tokenAddress));
// };

// /**
//  * Generate an ERC721 asset ID
//  * @param tokenAddress The ERC721 token address
//  * @param tokenId The ERC721 token ID
//  */
// export const getERC721AssetID = (tokenAddress: string, tokenId: BigNumberish): string => {
//   return keccak256(encodeERC721AssetData(tokenAddress, tokenId));
// };

// /**
//  * Generate an ERC1155 asset ID
//  * @param tokenAddress The ERC1155 token address
//  * @param tokenId The ERC1155 token ID
//  */
// export const getERC1155AssetID = (tokenAddress: string, tokenId: BigNumberish): string => {
//   return keccak256(encodeERC1155AssetData(tokenAddress, tokenId));
// };
