// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { MAX_250_BIT_UNSIGNED } from '../../Constants.sol';

library Uint256 {
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
        return uint256(value) & MAX_250_BIT_UNSIGNED;
    }

    /// @notice Convert an address to a uint256
    /// @param addr The address to convert
    function toUint256(address addr) internal pure returns (uint256) {
        return uint256(uint160(addr));
    }
}
