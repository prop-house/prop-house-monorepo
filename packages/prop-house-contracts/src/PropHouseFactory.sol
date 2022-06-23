// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IDeploymentManager } from './interfaces/IDeploymentManager.sol';
import { IPropHouseFactory } from './interfaces/IPropHouseFactory.sol';
import { PropHouseProxy } from './proxies/PropHouseProxy.sol';
import { IPropHouse } from './interfaces/IPropHouse.sol';

contract PropHouseFactory is IPropHouseFactory {
    IDeploymentManager private immutable DeploymentManager;

    constructor(address _deploymentManager) {
        DeploymentManager = IDeploymentManager(_deploymentManager);
    }

    /// @notice Create and initialize a prop house proxy
    /// @param houseImpl The prop house implementation contract address
    function createHouse(address houseImpl) external {
        if (DeploymentManager.isValidDeploymentTarget(houseImpl)) {
            revert InvalidDeploymentTarget();
        }
        address house = address(new PropHouseProxy(houseImpl, ''));

        IPropHouse(house).initialize(msg.sender);
    }
}
