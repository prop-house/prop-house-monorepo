// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Award } from '../types/Common.sol';

library Sort {
    /// @notice Quicksort an array of awards from smallest to largest asset ID
    /// @param awards The awards to sort
    /// @param left The left index (starting index: `0`)
    /// @param right The right index (starting index: `awards.length - 1`)
    function sort(
        Award[] memory awards,
        int256 left,
        int256 right
    ) internal view {
        unchecked {
            int256 i = left;
            int256 j = right;
            if (i == j) return;
            Award memory pivot = awards[uint256(left + (right - left) / 2)];
            while (i <= j) {
                while (awards[uint256(i)].assetId < pivot.assetId) i++;
                while (pivot.assetId < awards[uint256(j)].assetId) j--;
                if (i <= j) {
                    (awards[uint256(i)], awards[uint256(j)]) = (awards[uint256(j)], awards[uint256(i)]);
                    i++;
                    j--;
                }
            }
            if (left < j) {
                sort(awards, left, j);
            }
            if (i < right) {
                sort(awards, i, right);
            }
        }
    }
}
