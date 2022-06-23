// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IDeploymentManager } from '../interfaces/IDeploymentManager.sol';
import { IRegistrarManager } from '../interfaces/IRegistrarManager.sol';

/// @title DeploymentManager
/// @notice This contract allows house creators to opt-in to deployment implementation targets registered by the Prop House DAO
contract DeploymentManager is IDeploymentManager {
    IRegistrarManager public immutable RegistrarManager;

    /// @notice If a contract is a registered deployment target
    mapping(address => bool) private deployments;

    /// @notice Require that the sender is the registrar
    modifier onlyRegistrar() {
        if (msg.sender != RegistrarManager.registrar()) {
            revert OnlyRegistrar();
        }
        _;
    }

    /// @param _registrarManager The address of the registrar manager
    constructor(address _registrarManager) {
        RegistrarManager = IRegistrarManager(_registrarManager);
    }

    /// @notice If target deployment implementation is valid
    /// @param _impl The address of the implementation
    function isValidDeploymentTarget(address _impl) external view returns (bool) {
        return deployments[_impl];
    }

    /// @notice Registers an implementation as a valid deployment target
    /// @param _impl The address of the valid target implementation
    function registerDeployment(address _impl) external onlyRegistrar {
        deployments[_impl] = true;

        emit DeploymentTargetRegistered(_impl);
    }

    /// @notice Unregisters an implementation
    /// @param _impl The address of the implementation to unregister
    function unregisterDeployment(address _impl) external onlyRegistrar {
        delete deployments[_impl];

        emit DeploymentTargetUnregistered(_impl);
    }
}
