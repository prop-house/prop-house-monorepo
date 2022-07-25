// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IDeploymentManager } from './interfaces/IDeploymentManager.sol';
import { IModuleFactory } from './interfaces/IModuleFactory.sol';
import { IModule } from './interfaces/IModule.sol';
import { ModuleProxy } from './ModuleProxy.sol';

contract ModuleFactory is IModuleFactory {
    IDeploymentManager private immutable DeploymentManager;

    constructor(address _deploymentManager) {
        DeploymentManager = IDeploymentManager(_deploymentManager);
    }

    /// @notice Create and initialize a module proxy
    /// @param moduleImpl The module implementation contract address
    /// @param data Initialization payload sent to the new proxy contract
    function create(address moduleImpl, bytes calldata data) external payable {
        if (!DeploymentManager.isValidDeploymentTarget(moduleImpl)) {
            revert InvalidDeploymentTarget();
        }
        address instance = address(new ModuleProxy(moduleImpl, ''));

        IModule(instance).initialize{ value: msg.value }(msg.sender, data);

        emit ModuleInstanceCreated(moduleImpl, instance);
    }
}
