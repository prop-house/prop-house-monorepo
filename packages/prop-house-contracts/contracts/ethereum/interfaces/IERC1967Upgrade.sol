// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @title IERC1967Upgrade
/// @notice The external ERC1967Upgrade events and errors
interface IERC1967Upgrade {
    /// @dev Thrown when an implementation is an invalid upgrade
    /// @param impl The address of the invalid implementation
    error InvalidUpgrade(address impl);

    /// @dev Thrown when an implementation upgrade is not stored at the storage slot of the original
    error UnsupportedUUID();

    /// @dev Thrown when an implementation does not support ERC1822 proxiableUUID()
    error OnlyUUPS();

    /// @notice Emitted when the implementation is upgraded
    /// @param impl The address of the implementation
    event Upgraded(address impl);
}
