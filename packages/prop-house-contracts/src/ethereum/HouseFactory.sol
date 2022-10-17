// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IDeploymentManager } from './interfaces/IDeploymentManager.sol';
import { IHouseFactory } from './interfaces/IHouseFactory.sol';
import { IHouse } from './interfaces/IHouse.sol';
import { HouseProxy } from './HouseProxy.sol';

contract HouseFactory is IHouseFactory {
    IDeploymentManager private immutable DeploymentManager;

    /// @notice Returns true if the address is a valid house
    mapping(address => bool) public isHouse;

    constructor(address _deploymentManager) {
        DeploymentManager = IDeploymentManager(_deploymentManager);
    }

    /// @notice Create and initialize a house proxy
    /// @param houseImpl The house implementation contract address
    /// @param data Initialization payload sent to the proxy contract
    function create(address houseImpl, bytes calldata data) external payable returns (address house) {
        if (!DeploymentManager.isValidDeploymentTarget(houseImpl)) {
            revert InvalidDeploymentTarget();
        }
        house = address(new HouseProxy(houseImpl, ''));
        isHouse[house] = true;

        IHouse(house).initialize{ value: msg.value }(msg.sender, data);

        emit HouseCreated(houseImpl, house);
    }
}
