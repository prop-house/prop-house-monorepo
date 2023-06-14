// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IERC165 } from './IERC165.sol';

/// @notice Interface that must be implemented by all round types
interface IRound is IERC165 {
    /// @notice Thrown when the caller of a guarded function is not the prop house contract
    error ONLY_PROP_HOUSE();

    /// @notice Thrown when the caller of a guarded function is not the round manager
    error ONLY_ROUND_MANAGER();

    /// @notice Thrown when the address of a provided strategy is zero
    /// @param strategy The address of the strategy
    error INVALID_STRATEGY(uint256 strategy);

    /// @notice The round type
    function kind() external view returns (bytes32);

    /// @notice Initialize the round
    /// @param data The optional round data. If empty, round registration is deferred.
    function initialize(bytes calldata data) external payable;

    /// @notice The house that the round belongs to
    function house() external view returns (address);

    /// @notice The round ID
    function id() external view returns (uint256);
}
