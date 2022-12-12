// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IDeploymentManager } from '../interfaces/IDeploymentManager.sol';
import { IRegistrarManager } from '../interfaces/IRegistrarManager.sol';

/// @title DeploymentManager
/// @notice This contract allows the registrar to manage house implementation deployment targets
contract DeploymentManager is IDeploymentManager {
    IRegistrarManager public immutable RegistrarManager;

    /// @notice If a contract is a registered deployment target
    mapping(address => bool) private deployments;

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

    /// @notice If target deployment implementation is valid
    /// @param impl The address of the implementation
    function isValidDeploymentTarget(address impl) external view returns (bool) {
        return deployments[impl];
    }

    /// @notice Registers an implementation as a valid deployment target
    /// @param impl The address of the valid target implementation
    function registerDeployment(address impl) external onlyRegistrar {
        deployments[impl] = true;

        emit DeploymentTargetRegistered(impl);
    }

    /// @notice Unregisters an implementation
    /// @param impl The address of the implementation to unregister
    function unregisterDeployment(address impl) external onlyRegistrar {
        delete deployments[impl];

        emit DeploymentTargetUnregistered(impl);
    }
}
