// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IUUPS } from '../../interfaces/IUUPS.sol';
import { ERC1967Upgrade } from './ERC1967Upgrade.sol';

/// @title UUPS
/// @notice Modified from Rohan Kulkarni's work for Nouns Builder
/// Originally modified from OpenZeppelin Contracts v4.7.3 (proxy/utils/UUPSUpgradeable.sol)
/// - Uses custom errors declared in IUUPS
/// - Inherits a modern, minimal ERC1967Upgrade
abstract contract UUPS is IUUPS, ERC1967Upgrade {
    /// @dev The address of the implementation
    address private immutable __self = address(this);

    /// @dev Ensures that execution is via proxy delegatecall with the correct implementation
    modifier onlyProxy() {
        if (address(this) == __self) revert OnlyDelegateCall();
        if (_getImplementation() != __self) revert OnlyProxy();
        _;
    }

    /// @dev Ensures that execution is via direct call
    modifier notDelegated() {
        if (address(this) != __self) revert OnlyCall();
        _;
    }

    /// @dev Hook to authorize an implementation upgrade
    /// @param newImpl The new implementation address
    function _authorizeUpgrade(address newImpl) internal virtual;

    /// @notice Upgrades to an implementation
    /// @param newImpl The new implementation address
    function upgradeTo(address newImpl) external onlyProxy {
        _authorizeUpgrade(newImpl);
        _upgradeToAndCallUUPS(newImpl, '', false);
    }

    /// @notice Upgrades to an implementation with an additional function call
    /// @param newImpl The new implementation address
    /// @param data The encoded function call
    function upgradeToAndCall(address newImpl, bytes memory data) external payable onlyProxy {
        _authorizeUpgrade(newImpl);
        _upgradeToAndCallUUPS(newImpl, data, true);
    }

    /// @notice The storage slot of the implementation address
    function proxiableUUID() external view notDelegated returns (bytes32) {
        if (address(this) != __self) revert OnlyCall();
        return _IMPLEMENTATION_SLOT;
    }
}
