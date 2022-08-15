// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { UUPSUpgradeable } from '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import { OwnableUpgradeable } from '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import { IStrategyManager } from './interfaces/IStrategyManager.sol';
import { IUpgradeManager } from './interfaces/IUpgradeManager.sol';
import { IStarknetCore } from './interfaces/IStarknetCore.sol';
import { IModule } from './interfaces/IModule.sol';
import { Multicall } from './utils/Multicall.sol';

abstract contract ModuleBase is IModule, Multicall, UUPSUpgradeable, OwnableUpgradeable {
    // prettier-ignore
    uint256 constant GOVERNANCE_RELAY_SELECTOR = 111111111111111111111111111111111111111111111111111111111111111111111111111;

    IUpgradeManager internal immutable _upgradeManager;
    IStrategyManager internal immutable _strategyManager;
    IStarknetCore internal immutable _starknetCore;
    uint256 internal immutable _l2GovEntryPoint;

    constructor(
        address upgradeManager_,
        address strategyManager_,
        address starknetCore_,
        uint256 l2GovEntryPoint_
    ) payable initializer {
        _upgradeManager = IUpgradeManager(upgradeManager_);
        _strategyManager = IStrategyManager(strategyManager_);
        _starknetCore = IStarknetCore(starknetCore_);
        _l2GovEntryPoint = l2GovEntryPoint_;
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
        if (!_upgradeManager.isValidUpgrade(_getImplementation(), _newImpl)) {
            revert InvalidUpgrade();
        }
    }
}
