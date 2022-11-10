// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface that must be implemented by all strategy validators
interface IStrategyValidator {
    /// @notice Validate the strategy `data` and return the formatted L2 params
    /// @param data Configuration data required by the strategy
    function getStrategyParams(bytes calldata data) external returns (uint256[] memory);
}
