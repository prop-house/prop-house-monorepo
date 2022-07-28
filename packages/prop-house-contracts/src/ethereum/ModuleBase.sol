// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { UUPSUpgradeable } from '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import { OwnableUpgradeable } from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import { IIntegrationManager } from './interfaces/IIntegrationManager.sol';
import { IUpgradeManager } from './interfaces/IUpgradeManager.sol';
import { IModule } from './interfaces/IModule.sol';

abstract contract ModuleBase is IModule, UUPSUpgradeable, OwnableUpgradeable {
    IUpgradeManager internal immutable UpgradeManager;
    IIntegrationManager internal immutable IntegrationManager;

    constructor(address _upgradeManager, address _integrationManager) payable initializer {
        UpgradeManager = IUpgradeManager(_upgradeManager);
        IntegrationManager = IIntegrationManager(_integrationManager);
    }

    /// @notice Initialize the module implementation
    /// @param _creator The creator of the module instance
    function initialize(address _creator) internal initializer {
        __Ownable_init();

        // Transfer ownership to the DAO creator
        transferOwnership(_creator);
    }

    /// @notice Ensures the caller is authorized to upgrade the contract to a valid implementation
    /// @dev This function is called in UUPS `upgradeTo` & `upgradeToAndCall`
    /// @param _newImpl The address of the new implementation
    function _authorizeUpgrade(address _newImpl) internal override onlyOwner {
        if (!UpgradeManager.isValidUpgrade(_getImplementation(), _newImpl)) {
            revert InvalidUpgrade();
        }
    }
}
