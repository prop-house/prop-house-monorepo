// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface that must be implemented by all strategies
interface IStrategy {
    /// @notice Validate the strategy `data` and return the L2 payload
    /// @param data Configuration data required by the strategy
    function getL2Payload(bytes calldata data) external returns (uint256[] memory);
}
