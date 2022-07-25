// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IIntegrationManager } from '../interfaces/IIntegrationManager.sol';
import { IRegistrarManager } from '../interfaces/IRegistrarManager.sol';

/// @title IntegrationManager
/// @notice This contract allows module owners to opt-in to implementation upgrades registered by the Prop House DAO
contract IntegrationManager is IIntegrationManager {
    IRegistrarManager public immutable RegistrarManager;

    struct IntegrationSettings {
        /// @notice Min compatible module implementation version. Disabled if 0.
        uint120 minVersion;
        /// @notice Max compatible module implementation version. None if 0.
        uint120 maxVersion;
        /// @notice Whether the integration is enabled.
        bool enabled;
    }

    /// @notice If a contract is a registered upgrade for an original implementation
    /// @dev Module Implemention ID => Integration Address => Integration Settings
    mapping(bytes32 => mapping(address => IntegrationSettings)) private integrations;

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
    /// @param _integration The address of the upgraded implementation
    function isValidIntegration(
        bytes32 _moduleImplId,
        uint256 _moduleImplVersion,
        address _integration
    ) external view returns (bool) {
        IntegrationSettings memory settings = integrations[_moduleImplId][_integration];
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

    /// @notice Registers an integration
    /// @dev Only callable by the registrar
    /// @param _moduleImplId The module implementation ID
    /// @param _integration The address of the implementation valid to upgrade to
    /// @param _minVersion Min compatible module implementation version. Disabled if 0.
    /// @param _maxVersion Max compatible module implementation version. None if 0.
    function registerIntegration(
        bytes32 _moduleImplId,
        address _integration,
        uint120 _minVersion,
        uint120 _maxVersion
    ) external onlyRegistrar {
        _registerIntegration(_moduleImplId, _integration, _minVersion, _maxVersion);
    }

    /// @notice Registers an integration with no versioning restrictions
    /// @dev Only callable by the registrar
    /// @param _moduleImplId The module implementation ID
    /// @param _integration The address of the implementation valid to upgrade to
    function registerIntegration(bytes32 _moduleImplId, address _integration) external onlyRegistrar {
        _registerIntegration(_moduleImplId, _integration, 0, 0);
    }

    /// @notice Set the min module implementation version that's compatible with an integration
    /// @param _moduleImplId The module implementation ID
    /// @param _integration The address of the implementation valid to upgrade to
    /// @param _minVersion Min compatible module implementation version. Disabled if 0.
    function setMinVersion(
        bytes32 _moduleImplId,
        address _integration,
        uint120 _minVersion
    ) external onlyRegistrar {
        if (!integrations[_moduleImplId][_integration].enabled) {
            revert IntegrationNotRegistered();
        }
        integrations[_moduleImplId][_integration].minVersion = _minVersion;

        emit MinCompatibleVersionSet(_moduleImplId, _integration, _minVersion);
    }

    /// @notice Set the max module implementation version that's compatible with an integration
    /// @param _moduleImplId The module implementation ID
    /// @param _integration The address of the implementation valid to upgrade to
    function setMaxVersion(
        bytes32 _moduleImplId,
        address _integration,
        uint120 _maxVersion
    ) external onlyRegistrar {
        if (!integrations[_moduleImplId][_integration].enabled) {
            revert IntegrationNotRegistered();
        }
        integrations[_moduleImplId][_integration].maxVersion = _maxVersion;

        emit MaxCompatibleVersionSet(_moduleImplId, _integration, _maxVersion);
    }

    /// @notice Unregisters an integration
    /// @param _moduleImplId The module implementation ID
    /// @param _integration The address of the implementation to unregister
    function unregisterIntegration(bytes32 _moduleImplId, address _integration) external onlyRegistrar {
        delete integrations[_moduleImplId][_integration];

        emit IntegrationUnregistered(_moduleImplId, _integration);
    }

    /// @notice Registers an integration
    /// @param _moduleImplId The module implementation ID
    /// @param _integration The address of the implementation valid to upgrade to
    /// @param _minVersion Min compatible module implementation version. Disabled if 0.
    /// @param _maxVersion Max compatible module implementation version. None if 0.
    function _registerIntegration(
        bytes32 _moduleImplId,
        address _integration,
        uint120 _minVersion,
        uint120 _maxVersion
    ) internal {
        integrations[_moduleImplId][_integration] = IntegrationSettings({
            minVersion: _minVersion,
            maxVersion: _maxVersion,
            enabled: true
        });

        emit IntegrationRegistered(_moduleImplId, _integration, _minVersion, _maxVersion);
    }
}
