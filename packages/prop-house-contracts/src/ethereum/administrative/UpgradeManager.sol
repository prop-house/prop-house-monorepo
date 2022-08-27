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
    /// @param _prevImpl The address of the original implementation
    /// @param _newImpl The address of the upgraded implementation
    function isValidUpgrade(address _prevImpl, address _newImpl) external view returns (bool) {
        return upgrades[_prevImpl][_newImpl];
    }

    /// @notice Registers an implementation as a valid upgrade
    /// @param _prevImpl The address of the original implementation
    /// @param _newImpl The address of the implementation valid to upgrade to
    function registerUpgrade(address _prevImpl, address _newImpl) external onlyRegistrar {
        upgrades[_prevImpl][_newImpl] = true;

        emit UpgradeRegistered(_prevImpl, _newImpl);
    }

    /// @notice Unregisters an implementation
    /// @param _prevImpl The address of the implementation to revert back to
    /// @param _newImpl The address of the implementation to unregister
    function unregisterUpgrade(address _prevImpl, address _newImpl) external onlyRegistrar {
        delete upgrades[_prevImpl][_newImpl];

        emit UpgradeUnregistered(_prevImpl, _newImpl);
    }
}
