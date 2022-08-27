// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Common interface for a house
interface IHouse {
    /// @notice Thrown when an upgrade has not been registered for an implementation contract
    error InvalidUpgrade();

    /// @notice Thrown when a strategy is not enabled in the house instance
    error StrategyNotEnabled();

    /// @notice The string representation of the unique identifier
    function name() external view returns (string memory);

    /// @notice A unique identifier
    function id() external view returns (bytes32);

    /// @notice The house implementation contract version
    function version() external view returns (uint256);

    /// @notice Initialize the house
    /// @param creator The creator of the house
    /// @param data Initialization data
    function initialize(address creator, bytes calldata data) external payable;
}
