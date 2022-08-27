// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IDeploymentManager } from './interfaces/IDeploymentManager.sol';
import { IHouseFactory } from './interfaces/IHouseFactory.sol';
import { IHouse } from './interfaces/IHouse.sol';
import { HouseProxy } from './HouseProxy.sol';

contract HouseFactory is IHouseFactory {
    IDeploymentManager private immutable DeploymentManager;

    constructor(address _deploymentManager) {
        DeploymentManager = IDeploymentManager(_deploymentManager);
    }

    /// @notice Create and initialize a house proxy
    /// @param houseImpl The house implementation contract address
    /// @param data Initialization payload sent to the proxy contract
    function create(address houseImpl, bytes calldata data) external payable {
        if (!DeploymentManager.isValidDeploymentTarget(houseImpl)) {
            revert InvalidDeploymentTarget();
        }
        address house = address(new HouseProxy(houseImpl, ''));

        IHouse(house).initialize{ value: msg.value }(msg.sender, data);

        emit HouseCreated(houseImpl, house);
    }
}
