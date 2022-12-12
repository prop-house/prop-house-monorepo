// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface for the Upgrade Manager
interface IUpgradeManager {
    /// @notice Emitted when an upgrade is registered
    /// @param prevImpl The address of the previous implementation
    /// @param newImpl The address of the registered upgrade
    event UpgradeRegistered(address prevImpl, address newImpl);

    /// @notice Emitted when an upgrade is unregistered
    /// @param prevImpl The address of the previous implementation
    /// @param newImpl The address of the unregistered upgrade
    event UpgradeUnregistered(address prevImpl, address newImpl);

    /// @notice Determine if an upgraded implementation has been registered for its original implementation
    /// @param prevImpl The address of the original implementation
    /// @param newImpl The address of the upgraded implementation
    function isValidUpgrade(address prevImpl, address newImpl) external returns (bool);
}
