// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { UUPSUpgradeable } from '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import { OwnableUpgradeable } from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';

import { IPropHouse } from './interfaces/IPropHouse.sol';
import { IUpgradeManager } from './interfaces/IUpgradeManager.sol';

contract PropHouse is IPropHouse, UUPSUpgradeable, OwnableUpgradeable {
    IUpgradeManager private immutable UpgradeManager;

    constructor(address _upgradeManager) payable initializer {
        UpgradeManager = IUpgradeManager(_upgradeManager);
    }

    /// @notice Initialize the prop house implementation
    /// @param _creator The creator of the prop house
    /// @param _data Initialization data
    function initialize(address _creator, bytes calldata _data) external initializer {
        __Ownable_init();

        // Transfer ownership to the house creator
        transferOwnership(_creator);

        // TODO: Define V1 initialization data
        _data;
    }

    /// @notice Ensures the caller is authorized to upgrade the contract to a valid implementation
    /// @dev This function is called in UUPS `upgradeTo` & `upgradeToAndCall`
    /// @param _newImpl The address of the new implementation
    function _authorizeUpgrade(address _newImpl) internal override onlyOwner {
        if (UpgradeManager.isValidUpgrade(_getImplementation(), _newImpl)) {
            revert InvalidUpgrade();
        }
    }
}
