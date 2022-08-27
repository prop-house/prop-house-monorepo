// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IStrategyManager } from '../interfaces/IStrategyManager.sol';
import { IRegistrarManager } from '../interfaces/IRegistrarManager.sol';

/// @title StrategyManager
/// @notice This contract allows the registrar to manage house strategies, the building blocks of houses
contract StrategyManager is IStrategyManager {
    IRegistrarManager public immutable RegistrarManager;

    struct StrategySettings {
        /// @notice Min compatible house implementation version. Disabled if 0.
        uint120 minVersion;
        /// @notice Max compatible house implementation version. None if 0.
        uint120 maxVersion;
        /// @notice Whether the strategy is enabled.
        bool enabled;
    }

    /// @notice If a contract is a registered upgrade for an original implementation
    /// @dev House Implemention ID => Strategy Address => Strategy Settings
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
    /// @param _houseImplId The house implementation ID
    /// @param _houseImplVersion The house implementation version
    /// @param _strategy The address of the upgraded implementation
    function isValidStrategy(
        bytes32 _houseImplId,
        uint256 _houseImplVersion,
        address _strategy
    ) external view returns (bool) {
        StrategySettings memory settings = strategies[_houseImplId][_strategy];
        if (!settings.enabled) {
            return false;
        }
        if (_houseImplVersion < settings.minVersion) {
            return false;
        }
        if (settings.maxVersion != 0 && _houseImplVersion > settings.maxVersion) {
            return false;
        }
        return true;
    }

    /// @notice Registers an strategy
    /// @dev Only callable by the registrar
    /// @param _houseImplId The house implementation ID
    /// @param _strategy The address of the implementation valid to upgrade to
    /// @param _minVersion Min compatible house implementation version. Disabled if 0.
    /// @param _maxVersion Max compatible house implementation version. None if 0.
    function registerStrategy(
        bytes32 _houseImplId,
        address _strategy,
        uint120 _minVersion,
        uint120 _maxVersion
    ) external onlyRegistrar {
        _registerStrategy(_houseImplId, _strategy, _minVersion, _maxVersion);
    }

    /// @notice Registers an strategy with no versioning restrictions
    /// @dev Only callable by the registrar
    /// @param _houseImplId The house implementation ID
    /// @param _strategy The address of the implementation valid to upgrade to
    function registerStrategy(bytes32 _houseImplId, address _strategy) external onlyRegistrar {
        _registerStrategy(_houseImplId, _strategy, 0, 0);
    }

    /// @notice Set the min house implementation version that's compatible with an strategy
    /// @param _houseImplId The house implementation ID
    /// @param _strategy The address of the implementation valid to upgrade to
    /// @param _minVersion Min compatible house implementation version. Disabled if 0.
    function setMinVersion(
        bytes32 _houseImplId,
        address _strategy,
        uint120 _minVersion
    ) external onlyRegistrar {
        if (!strategies[_houseImplId][_strategy].enabled) {
            revert StrategyNotRegistered();
        }
        strategies[_houseImplId][_strategy].minVersion = _minVersion;

        emit MinCompatibleVersionSet(_houseImplId, _strategy, _minVersion);
    }

    /// @notice Set the max house implementation version that's compatible with an strategy
    /// @param _houseImplId The house implementation ID
    /// @param _strategy The address of the implementation valid to upgrade to
    function setMaxVersion(
        bytes32 _houseImplId,
        address _strategy,
        uint120 _maxVersion
    ) external onlyRegistrar {
        if (!strategies[_houseImplId][_strategy].enabled) {
            revert StrategyNotRegistered();
        }
        strategies[_houseImplId][_strategy].maxVersion = _maxVersion;

        emit MaxCompatibleVersionSet(_houseImplId, _strategy, _maxVersion);
    }

    /// @notice Unregisters an strategy
    /// @param _houseImplId The house implementation ID
    /// @param _strategy The address of the implementation to unregister
    function unregisterStrategy(bytes32 _houseImplId, address _strategy) external onlyRegistrar {
        delete strategies[_houseImplId][_strategy];

        emit StrategyUnregistered(_houseImplId, _strategy);
    }

    /// @notice Registers an strategy
    /// @param _houseImplId The house implementation ID
    /// @param _strategy The address of the implementation valid to upgrade to
    /// @param _minVersion Min compatible house implementation version. Disabled if 0.
    /// @param _maxVersion Max compatible house implementation version. None if 0.
    function _registerStrategy(
        bytes32 _houseImplId,
        address _strategy,
        uint120 _minVersion,
        uint120 _maxVersion
    ) internal {
        strategies[_houseImplId][_strategy] = StrategySettings({
            minVersion: _minVersion,
            maxVersion: _maxVersion,
            enabled: true
        });

        emit StrategyRegistered(_houseImplId, _strategy, _minVersion, _maxVersion);
    }
}
