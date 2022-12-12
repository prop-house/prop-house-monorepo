// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @title IInitializable
/// @notice The external Initializable events and errors
interface IInitializable {
    /// @dev Thrown when disabling initializers during initialization
    error Initializing();

    /// @dev Thrown when calling an initialization function outside of initialization
    error NotInitializing();

    /// @dev Thrown when reinitializing incorrectly
    error AlreadyInitialized();

    /// @notice Emitted when the contract has been initialized or reinitialized
    event Initialized(uint256 version);
}
