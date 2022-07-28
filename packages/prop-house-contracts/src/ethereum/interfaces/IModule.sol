// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Common interface for a module
interface IModule {
    /// @notice Thrown when an upgrade has not been registered for an implementation contract
    error InvalidUpgrade();

    /// @notice A unique identifier
    function id() external view returns (bytes32);

    /// @notice The string representation of the unique identifier
    function name() external view returns (string memory);

    /// @notice The module implementation contract version
    function version() external view returns (uint256);

    /// @notice Initialize the module instance
    /// @param creator The creator of the module instance
    /// @param data Initialization data
    function initialize(address creator, bytes calldata data) external payable;
}
