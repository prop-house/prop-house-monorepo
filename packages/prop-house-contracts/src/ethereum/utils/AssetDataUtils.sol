// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IAssetData } from '../interfaces/IAssetData.sol';
import { ETH_ADDRESS } from '../Constants.sol';

library AssetDataUtils {
    /// @notice Thrown when an asset data has an unknown asset type
    error InvalidAssetType();

    /// @notice Thrown when attempting to read beyond the bounds of a byte array
    error ByteArrayTooShort();

    /// @notice Decodes an asset data and returns the asset type, contract address, and asset ID
    /// @param assetData The data describing an asset
    function decodeAssetData(bytes memory assetData)
        internal
        pure
        returns (
            bytes4 assetType,
            address assetAddress,
            bytes32 assetId
        )
    {
        assetType = extractAssetType(assetData);
        if (assetType == IAssetData.ETH.selector) {
            (assetAddress, assetId) = decodeETHAssetData(assetType, assetData);
        } else if (assetType == IAssetData.ERC20Token.selector) {
            (assetAddress, assetId) = decodeERC20AssetData(assetType, assetData);
        } else if (assetType == IAssetData.ERC721Token.selector) {
            (assetAddress, , assetId) = decodeERC721AssetData(assetType, assetData);
        } else if (assetType == IAssetData.ERC1155Token.selector) {
            (assetAddress, , assetId) = decodeERC1155AssetData(assetType, assetData);
        } else {
            revert InvalidAssetType();
        }
        return (assetType, assetAddress, assetId);
    }

    /// @notice Decodes an asset data and returns the asset type, contract address, token ID information, and asset ID
    /// @param assetData The data describing an asset
    function decodeAssetDataWithTokenIdInfo(bytes memory assetData)
        internal
        pure
        returns (
            bytes4 assetType,
            address assetAddress,
            bool hasTokenId,
            uint256 tokenId,
            bytes32 assetId
        )
    {
        assetType = extractAssetType(assetData);
        if (assetType == IAssetData.ETH.selector) {
            (assetAddress, assetId) = decodeETHAssetData(assetType, assetData);
        } else if (assetType == IAssetData.ERC20Token.selector) {
            (assetAddress, assetId) = decodeERC20AssetData(assetType, assetData);
        } else if (assetType == IAssetData.ERC721Token.selector) {
            (assetAddress, tokenId, assetId) = decodeERC721AssetData(assetType, assetData);
            hasTokenId = true;
        } else if (assetType == IAssetData.ERC1155Token.selector) {
            (assetAddress, tokenId, assetId) = decodeERC1155AssetData(assetType, assetData);
            hasTokenId = true;
        } else {
            revert InvalidAssetType();
        }
        return (assetType, assetAddress, hasTokenId, tokenId, assetId);
    }

    /// @notice Calculates the asset ID from an asset type and token address
    /// @param assetType The asset type
    /// @param token The token address
    function getAssetID(bytes4 assetType, address token) internal pure returns (bytes32) {
        return bytes32(abi.encodePacked(assetType, token));
    }

    /// @notice Calculates the asset ID from an asset type, token address, and token ID
    /// @param assetType The asset type
    /// @param token The token address
    /// @param tokenId The token ID
    function getAssetID(
        bytes4 assetType,
        address token,
        uint256 tokenId
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(assetType, token, tokenId));
    }

    /// @notice Extract the 4-byte asset type from an asset data array
    /// @param assetData The asset data describing an asset
    function extractAssetType(bytes memory assetData) internal pure returns (bytes4) {
        return readBytes4(assetData, 0);
    }

    /// @notice Decodes an ETH asset data and returns the ETH-pseudo contract address and asset ID
    /// @dev This function expects the `assetType` to have already been validated
    function decodeETHAssetData(bytes4, bytes memory) internal pure returns (address, bytes32) {
        return (ETH_ADDRESS, IAssetData.ETH.selector);
    }

    /// @notice Decodes an ERC20 asset data and returns the contract address and asset ID
    /// @dev This function expects the `assetType` to have already been validated
    /// @param assetType The type of asset described in `assetData`
    /// @param assetData The asset data describing an ERC20 asset
    function decodeERC20AssetData(bytes4 assetType, bytes memory assetData) internal pure returns (address, bytes32) {
        address tokenAddress = readAddress(assetData, 16);
        return (tokenAddress, getAssetID(assetType, tokenAddress));
    }

    /// @notice Decodes an ERC721 asset data and returns the contract address and asset ID
    /// @dev This function expects the `assetType` to have already been validated
    /// @param assetType The type of asset described in `assetData`
    /// @param assetData The asset data describing an ERC721 asset
    function decodeERC721AssetData(bytes4 assetType, bytes memory assetData)
        internal
        pure
        returns (
            address,
            uint256,
            bytes32
        )
    {
        address tokenAddress = readAddress(assetData, 16);
        uint256 tokenId = readUint256(assetData, 36);
        return (tokenAddress, tokenId, getAssetID(assetType, tokenAddress, tokenId));
    }

    /// @notice Decodes an ERC1155 asset data and returns the contract address and asset ID
    /// @dev This function expects the `assetType` to have already been validated
    /// @param assetType The type of asset described in `assetData`
    /// @param assetData The asset data describing an ERC1155 asset
    function decodeERC1155AssetData(bytes4 assetType, bytes memory assetData)
        internal
        pure
        returns (
            address,
            uint256,
            bytes32
        )
    {
        address tokenAddress = readAddress(assetData, 16);
        uint256 tokenId = readUint256(assetData, 36);
        return (tokenAddress, tokenId, getAssetID(assetType, tokenAddress, tokenId));
    }

    /// @notice Reads an unpadded bytes4 value from a position in a byte array
    /// @param b The byte array containing a bytes4 value
    /// @param index The index in byte array of bytes4 value
    function readBytes4(bytes memory b, uint256 index) private pure returns (bytes4 result) {
        if (b.length < index + 4) {
            revert ByteArrayTooShort();
        }

        // Arrays are prefixed by a 32 byte length field
        index += 32;

        // Read the bytes4 from array memory
        assembly {
            result := mload(add(b, index))
            // Solidity does not require us to clean the trailing bytes.
            // We do it anyway
            result := and(result, 0xFFFFFFFF00000000000000000000000000000000000000000000000000000000)
        }
        return result;
    }

    /// @notice Reads a uint256 value from a position in a byte array
    /// @param b The byte array containing a uint256 value
    /// @param index The index in byte array of uint256 value
    function readUint256(bytes memory b, uint256 index) internal pure returns (uint256 result) {
        result = uint256(readBytes32(b, index));
        return result;
    }

    /// @notice Reads a bytes32 value from a position in a byte array
    /// @param b The byte array containing a bytes32 value
    /// @param index The index in byte array of bytes32 value
    function readBytes32(bytes memory b, uint256 index) internal pure returns (bytes32 result) {
        if (b.length < index + 32) {
            revert ByteArrayTooShort();
        }

        // Arrays are prefixed by a 256 bit length parameter
        index += 32;

        // Read the bytes32 from array memory
        assembly {
            result := mload(add(b, index))
        }
        return result;
    }

    /// @notice Reads an address from a position in a byte array
    /// @param b The byte array containing an address
    /// @param index The index in byte array of address
    function readAddress(bytes memory b, uint256 index) private pure returns (address result) {
        if (b.length < index + 20) {
            revert ByteArrayTooShort();
        }

        // Add offset to index:
        // 1. Arrays are prefixed by 32-byte length parameter (add 32 to index)
        // 2. Account for size difference between address length and 32-byte storage word (subtract 12 from index)
        index += 20;

        // Read address from array memory
        assembly {
            // 1. Add index to address of bytes array
            // 2. Load 32-byte word from memory
            // 3. Apply 20-byte mask to obtain address
            result := and(mload(add(b, index)), 0xffffffffffffffffffffffffffffffffffffffff)
        }
        return result;
    }
}
