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
    /// @param houseImplId The house implementation ID
    /// @param houseImplVersion The house implementation version
    /// @param strategy The address of the upgraded implementation
    function isValidStrategy(
        bytes32 houseImplId,
        uint256 houseImplVersion,
        address strategy
    ) external view returns (bool) {
        StrategySettings memory settings = strategies[houseImplId][strategy];
        if (!settings.enabled) {
            return false;
        }
        if (houseImplVersion < settings.minVersion) {
            return false;
        }
        if (settings.maxVersion != 0 && houseImplVersion > settings.maxVersion) {
            return false;
        }
        return true;
    }

    /// @notice Registers an strategy
    /// @dev Only callable by the registrar
    /// @param houseImplId The house implementation ID
    /// @param strategy The address of the implementation valid to upgrade to
    /// @param minVersion Min compatible house implementation version. Disabled if 0.
    /// @param maxVersion Max compatible house implementation version. None if 0.
    function registerStrategy(
        bytes32 houseImplId,
        address strategy,
        uint120 minVersion,
        uint120 maxVersion
    ) external onlyRegistrar {
        _registerStrategy(houseImplId, strategy, minVersion, maxVersion);
    }

    /// @notice Registers an strategy with no versioning restrictions
    /// @dev Only callable by the registrar
    /// @param houseImplId The house implementation ID
    /// @param strategy The address of the implementation valid to upgrade to
    function registerStrategy(bytes32 houseImplId, address strategy) external onlyRegistrar {
        _registerStrategy(houseImplId, strategy, 0, 0);
    }

    /// @notice Set the min house implementation version that's compatible with an strategy
    /// @param houseImplId The house implementation ID
    /// @param strategy The address of the implementation valid to upgrade to
    /// @param minVersion Min compatible house implementation version. Disabled if 0.
    function setMinVersion(
        bytes32 houseImplId,
        address strategy,
        uint120 minVersion
    ) external onlyRegistrar {
        if (!strategies[houseImplId][strategy].enabled) {
            revert StrategyNotRegistered();
        }
        strategies[houseImplId][strategy].minVersion = minVersion;

        emit MinCompatibleVersionSet(houseImplId, strategy, minVersion);
    }

    /// @notice Set the max house implementation version that's compatible with an strategy
    /// @param houseImplId The house implementation ID
    /// @param strategy The address of the implementation valid to upgrade to
    /// @param maxVersion Max compatible house implementation version. None if 0.
    function setMaxVersion(
        bytes32 houseImplId,
        address strategy,
        uint120 maxVersion
    ) external onlyRegistrar {
        if (!strategies[houseImplId][strategy].enabled) {
            revert StrategyNotRegistered();
        }
        strategies[houseImplId][strategy].maxVersion = maxVersion;

        emit MaxCompatibleVersionSet(houseImplId, strategy, maxVersion);
    }

    /// @notice Unregisters an strategy
    /// @param houseImplId The house implementation ID
    /// @param strategy The address of the implementation to unregister
    function unregisterStrategy(bytes32 houseImplId, address strategy) external onlyRegistrar {
        delete strategies[houseImplId][strategy];

        emit StrategyUnregistered(houseImplId, strategy);
    }

    /// @notice Registers an strategy
    /// @param houseImplId The house implementation ID
    /// @param strategy The address of the implementation valid to upgrade to
    /// @param minVersion Min compatible house implementation version. Disabled if 0.
    /// @param maxVersion Max compatible house implementation version. None if 0.
    function _registerStrategy(
        bytes32 houseImplId,
        address strategy,
        uint120 minVersion,
        uint120 maxVersion
    ) internal {
        strategies[houseImplId][strategy] = StrategySettings({
            minVersion: minVersion,
            maxVersion: maxVersion,
            enabled: true
        });

        emit StrategyRegistered(houseImplId, strategy, minVersion, maxVersion);
    }
}
