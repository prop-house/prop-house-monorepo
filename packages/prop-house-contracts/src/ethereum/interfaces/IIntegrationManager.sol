// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface for the Integration Manager
interface IIntegrationManager {
    /// @notice Thrown when an operation is attempted on an unregistered integration
    error IntegrationNotRegistered();

    /// @notice Emitted when an integration is registered
    /// @param moduleImplId The ID of the module implementation
    /// @param integration The address of the integration
    /// @param minVersion Min compatible module implementation version. Disabled if 0.
    /// @param maxVersion Max compatible module implementation version. Disabled if 0.
    event IntegrationRegistered(bytes32 moduleImplId, address integration, uint120 minVersion, uint120 maxVersion);

    /// @notice Emitted when an integration is unregistered
    /// @param moduleImplId The ID of the module implementation
    /// @param integration The address of the unregistered integration
    event IntegrationUnregistered(bytes32 moduleImplId, address integration);

    /// @notice Emitted when a min compatible module implementation version is set
    /// @param moduleImplId The ID of the module implementation
    /// @param integration The address of the integration
    /// @param minVersion Min compatible module implementation version. Disabled if 0.
    event MinCompatibleVersionSet(bytes32 moduleImplId, address integration, uint120 minVersion);

    /// @notice Emitted when a max compatible module implementation version is set
    /// @param moduleImplId The ID of the module implementation
    /// @param integration The address of the integration
    /// @param maxVersion Max compatible module implementation version. Disabled if 0.
    event MaxCompatibleVersionSet(bytes32 moduleImplId, address integration, uint120 maxVersion);

    /// @notice Determine if an integration is valid for a given module implementation
    /// @param _moduleImplId The ID of the module implementation
    /// @param _moduleImplVersion The module implementation version
    /// @param _integration The address of the upgraded implementation
    function isValidIntegration(
        bytes32 _moduleImplId,
        uint256 _moduleImplVersion,
        address _integration
    ) external returns (bool);
}
