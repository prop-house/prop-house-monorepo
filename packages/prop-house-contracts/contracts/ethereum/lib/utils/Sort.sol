// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { PackedAsset } from '../types/Common.sol';

library Sort {
    /// @notice Quicksort an array of packed assets from smallest to largest asset ID
    /// @param assets The packed assets to sort
    /// @param left The left index (starting index: `0`)
    /// @param right The right index (starting index: `assets.length - 1`)
    function sort(
        PackedAsset[] memory assets,
        int256 left,
        int256 right
    ) internal view {
        unchecked {
            int256 i = left;
            int256 j = right;
            if (i == j) return;
            PackedAsset memory pivot = assets[uint256(left + (right - left) / 2)];
            while (i <= j) {
                while (assets[uint256(i)].assetId < pivot.assetId) i++;
                while (pivot.assetId < assets[uint256(j)].assetId) j--;
                if (i <= j) {
                    (assets[uint256(i)], assets[uint256(j)]) = (assets[uint256(j)], assets[uint256(i)]);
                    i++;
                    j--;
                }
            }
            if (left < j) {
                sort(assets, left, j);
            }
            if (i < right) {
                sort(assets, i, right);
            }
        }
    }
}
