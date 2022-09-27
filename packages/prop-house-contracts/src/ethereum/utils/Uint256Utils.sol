// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { MASK_250 } from '../Constants.sol';

library Uint256Utils {
    /// @notice Split a uint256 into a high and low value
    /// @param value The uint256 value to split
    /// @dev This is useful for passing uint256 values to Starknet, whose felt
    /// type only supports 251 bits.
    function split(uint256 value) internal pure returns (uint256, uint256) {
        uint256 low = value & ((1 << 128) - 1);
        uint256 high = value >> 128;
        return (low, high);
    }

    /// Mask the passed `value` to 250 bits
    /// @param value The value to mask
    function mask250(bytes32 value) internal pure returns (uint256) {
        return uint256(value) & MASK_250;
    }

    /// @notice Convert an address to a uint256
    /// @param addr The address to convert
    function toUint256(address addr) internal pure returns (uint256) {
        return uint256(uint160(addr));
    }
}
