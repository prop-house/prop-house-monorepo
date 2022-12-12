// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IERC1822Proxiable } from '@openzeppelin/contracts/interfaces/draft-IERC1822.sol';
import { StorageSlot } from '@openzeppelin/contracts/utils/StorageSlot.sol';

import { IERC1967Upgrade } from '../../interfaces/IERC1967Upgrade.sol';
import { Address } from '../utils/Address.sol';

/// @title ERC1967Upgrade
/// @notice Modified from Rohan Kulkarni's work for Nouns Builder
/// Originally modified from OpenZeppelin Contracts v4.7.3 (proxy/ERC1967/ERC1967Upgrade.sol)
/// - Uses custom errors declared in IERC1967Upgrade
/// - Removes ERC1967 admin and beacon support
abstract contract ERC1967Upgrade is IERC1967Upgrade {
    /// @dev bytes32(uint256(keccak256('eip1967.proxy.rollback')) - 1)
    bytes32 private constant _ROLLBACK_SLOT = 0x4910fdfa16fed3260ed0e7147f7cc6da11a60208b5b9406d12a635614ffd9143;

    /// @dev bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
    bytes32 internal constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;

    /// @dev Upgrades to an implementation with security checks for UUPS proxies and an additional function call
    /// @param newImpl The new implementation address
    /// @param data The encoded function call
    /// @param forceCall Whether or not the call should be made if `data` is empty
    function _upgradeToAndCallUUPS(
        address newImpl,
        bytes memory data,
        bool forceCall
    ) internal {
        if (StorageSlot.getBooleanSlot(_ROLLBACK_SLOT).value) {
            _setImplementation(newImpl);
        } else {
            try IERC1822Proxiable(newImpl).proxiableUUID() returns (bytes32 slot) {
                if (slot != _IMPLEMENTATION_SLOT) revert UnsupportedUUID();
            } catch {
                revert OnlyUUPS();
            }

            _upgradeToAndCall(newImpl, data, forceCall);
        }
    }

    /// @dev Upgrades to an implementation with an additional function call
    /// @param newImpl The new implementation address
    /// @param data The encoded function call
    /// @param forceCall Whether or not the call should be made if `data` is empty
    function _upgradeToAndCall(
        address newImpl,
        bytes memory data,
        bool forceCall
    ) internal {
        _upgradeTo(newImpl);

        if (data.length > 0 || forceCall) {
            Address.functionDelegateCall(newImpl, data);
        }
    }

    /// @dev Performs an implementation upgrade
    /// @param newImpl The new implementation address
    function _upgradeTo(address newImpl) internal {
        _setImplementation(newImpl);

        emit Upgraded(newImpl);
    }

    /// @dev Stores the address of an implementation
    /// @param impl The implementation address
    function _setImplementation(address impl) private {
        if (!Address.isContract(impl)) revert InvalidUpgrade(impl);

        StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value = impl;
    }

    /// @dev The address of the current implementation
    function _getImplementation() internal view returns (address) {
        return StorageSlot.getAddressSlot(_IMPLEMENTATION_SLOT).value;
    }
}
