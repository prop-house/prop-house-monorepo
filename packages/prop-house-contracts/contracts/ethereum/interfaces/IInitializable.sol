// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @title IInitializable
/// @notice The external Initializable events and errors
interface IInitializable {
    /// @dev Thrown when incorrectly initialized with address(0)
    error ADDRESS_ZERO();

    /// @dev Thrown when disabling initializers during initialization
    error INITIALIZING();

    /// @dev Thrown when calling an initialization function outside of initialization
    error NOT_INITIALIZING();

    /// @dev Thrown when reinitializing incorrectly
    error ALREADY_INITIALIZED();

    /// @notice Emitted when the contract has been initialized or reinitialized
    event Initialized(uint256 version);
}
