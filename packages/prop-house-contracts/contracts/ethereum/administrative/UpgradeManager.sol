// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IUpgradeManager } from '../interfaces/IUpgradeManager.sol';
import { IRegistrarManager } from '../interfaces/IRegistrarManager.sol';

/// @title UpgradeManager
/// @notice This contract allows the registrar to manage opt-in house implementation upgrade targets
contract UpgradeManager is IUpgradeManager {
    IRegistrarManager public immutable RegistrarManager;

    /// @notice If a contract is a registered upgrade for an original implementation
    /// @dev Original address => Upgrade address
    mapping(address => mapping(address => bool)) private upgrades;

    /// @notice Require that the sender is the registrar
    modifier onlyRegistrar() {
        if (msg.sender != RegistrarManager.registrar()) {
            revert IRegistrarManager.OnlyRegistrar();
        }
        _;
    }

    /// @param _registrarManager The address of the registrar manager
    constructor(address _registrarManager) {
        RegistrarManager = IRegistrarManager(_registrarManager);
    }

    /// @notice If an upgraded implementation has been registered for its original implementation
    /// @param prevImpl The address of the original implementation
    /// @param newImpl The address of the upgraded implementation
    function isValidUpgrade(address prevImpl, address newImpl) external view returns (bool) {
        return upgrades[prevImpl][newImpl];
    }

    /// @notice Registers an implementation as a valid upgrade
    /// @param prevImpl The address of the original implementation
    /// @param newImpl The address of the implementation valid to upgrade to
    function registerUpgrade(address prevImpl, address newImpl) external onlyRegistrar {
        upgrades[prevImpl][newImpl] = true;

        emit UpgradeRegistered(prevImpl, newImpl);
    }

    /// @notice Unregisters an implementation
    /// @param prevImpl The address of the implementation to revert back to
    /// @param newImpl The address of the implementation to unregister
    function unregisterUpgrade(address prevImpl, address newImpl) external onlyRegistrar {
        delete upgrades[prevImpl][newImpl];

        emit UpgradeUnregistered(prevImpl, newImpl);
    }
}
