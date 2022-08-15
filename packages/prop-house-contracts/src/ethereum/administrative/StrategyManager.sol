// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IStrategyManager } from '../interfaces/IStrategyManager.sol';
import { IRegistrarManager } from '../interfaces/IRegistrarManager.sol';

/// @title StrategyManager
/// @notice This contract allows the registrar to manage module strategies, the building blocks of modules
contract StrategyManager is IStrategyManager {
    IRegistrarManager public immutable RegistrarManager;

    struct StrategySettings {
        /// @notice Min compatible module implementation version. Disabled if 0.
        uint120 minVersion;
        /// @notice Max compatible module implementation version. None if 0.
        uint120 maxVersion;
        /// @notice Whether the strategy is enabled.
        bool enabled;
    }

    /// @notice If a contract is a registered upgrade for an original implementation
    /// @dev Module Implemention ID => Strategy Address => Strategy Settings
    mapping(bytes32 => mapping(address => StrategySettings)) private strategies;

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
    /// @param _moduleImplId The module implementation ID
    /// @param _moduleImplVersion The module implementation version
    /// @param _strategy The address of the upgraded implementation
    function isValidStrategy(
        bytes32 _moduleImplId,
        uint256 _moduleImplVersion,
        address _strategy
    ) external view returns (bool) {
        StrategySettings memory settings = strategies[_moduleImplId][_strategy];
        if (!settings.enabled) {
            return false;
        }
        if (_moduleImplVersion < settings.minVersion) {
            return false;
        }
        if (settings.maxVersion != 0 && _moduleImplVersion > settings.maxVersion) {
            return false;
        }
        return true;
    }

    /// @notice Registers an strategy
    /// @dev Only callable by the registrar
    /// @param _moduleImplId The module implementation ID
    /// @param _strategy The address of the implementation valid to upgrade to
    /// @param _minVersion Min compatible module implementation version. Disabled if 0.
    /// @param _maxVersion Max compatible module implementation version. None if 0.
    function registerStrategy(
        bytes32 _moduleImplId,
        address _strategy,
        uint120 _minVersion,
        uint120 _maxVersion
    ) external onlyRegistrar {
        _registerStrategy(_moduleImplId, _strategy, _minVersion, _maxVersion);
    }

    /// @notice Registers an strategy with no versioning restrictions
    /// @dev Only callable by the registrar
    /// @param _moduleImplId The module implementation ID
    /// @param _strategy The address of the implementation valid to upgrade to
    function registerStrategy(bytes32 _moduleImplId, address _strategy) external onlyRegistrar {
        _registerStrategy(_moduleImplId, _strategy, 0, 0);
    }

    /// @notice Set the min module implementation version that's compatible with an strategy
    /// @param _moduleImplId The module implementation ID
    /// @param _strategy The address of the implementation valid to upgrade to
    /// @param _minVersion Min compatible module implementation version. Disabled if 0.
    function setMinVersion(
        bytes32 _moduleImplId,
        address _strategy,
        uint120 _minVersion
    ) external onlyRegistrar {
        if (!strategies[_moduleImplId][_strategy].enabled) {
            revert StrategyNotRegistered();
        }
        strategies[_moduleImplId][_strategy].minVersion = _minVersion;

        emit MinCompatibleVersionSet(_moduleImplId, _strategy, _minVersion);
    }

    /// @notice Set the max module implementation version that's compatible with an strategy
    /// @param _moduleImplId The module implementation ID
    /// @param _strategy The address of the implementation valid to upgrade to
    function setMaxVersion(
        bytes32 _moduleImplId,
        address _strategy,
        uint120 _maxVersion
    ) external onlyRegistrar {
        if (!strategies[_moduleImplId][_strategy].enabled) {
            revert StrategyNotRegistered();
        }
        strategies[_moduleImplId][_strategy].maxVersion = _maxVersion;

        emit MaxCompatibleVersionSet(_moduleImplId, _strategy, _maxVersion);
    }

    /// @notice Unregisters an strategy
    /// @param _moduleImplId The module implementation ID
    /// @param _strategy The address of the implementation to unregister
    function unregisterStrategy(bytes32 _moduleImplId, address _strategy) external onlyRegistrar {
        delete strategies[_moduleImplId][_strategy];

        emit StrategyUnregistered(_moduleImplId, _strategy);
    }

    /// @notice Registers an strategy
    /// @param _moduleImplId The module implementation ID
    /// @param _strategy The address of the implementation valid to upgrade to
    /// @param _minVersion Min compatible module implementation version. Disabled if 0.
    /// @param _maxVersion Max compatible module implementation version. None if 0.
    function _registerStrategy(
        bytes32 _moduleImplId,
        address _strategy,
        uint120 _minVersion,
        uint120 _maxVersion
    ) internal {
        strategies[_moduleImplId][_strategy] = StrategySettings({
            minVersion: _minVersion,
            maxVersion: _maxVersion,
            enabled: true
        });

        emit StrategyRegistered(_moduleImplId, _strategy, _minVersion, _maxVersion);
    }
}
