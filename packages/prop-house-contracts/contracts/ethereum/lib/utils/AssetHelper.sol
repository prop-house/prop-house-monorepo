// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Asset, AssetType, PackedAsset } from '../types/Common.sol';

library AssetHelper {
    /// @notice Returns the packed asset information for the provided assets
    /// @param assets The asset information
    function pack(Asset[] memory assets) internal pure returns (PackedAsset[] memory packed) {
        unchecked {
            uint256 assetCount = assets.length;
            packed = new PackedAsset[](assetCount);

            for (uint256 i = 0; i < assetCount; ++i) {
                packed[i] = PackedAsset({ assetId: toID(assets[i]), amount: assets[i].amount });
            }
        }
    }

    /// @notice Calculates the asset IDs for the provided assets
    /// @param assets The asset information
    function toIDs(Asset[] memory assets) internal pure returns (uint256[] memory ids) {
        unchecked {
            uint256 assetCount = assets.length;
            ids = new uint256[](assetCount);

            for (uint256 i = 0; i < assetCount; ++i) {
                ids[i] = toID(assets[i]);
            }
        }
    }

    /// @dev Calculates the asset ID for the provided asset
    /// @param asset The asset information
    function toID(Asset memory asset) internal pure returns (uint256) {
        if (asset.assetType == AssetType.Native) {
            return uint256(asset.assetType);
        }
        if (asset.assetType == AssetType.ERC20) {
            return uint256(bytes32(abi.encodePacked(asset.assetType, asset.token)));
        }
        // prettier-ignore
        return uint256(
            bytes32(abi.encodePacked(asset.assetType, keccak256(abi.encodePacked(asset.token, asset.identifier))))
        );
    }
}
