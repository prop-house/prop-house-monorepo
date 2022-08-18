// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface for the Strategy Manager
interface IStrategyManager {
    /// @notice Thrown when an operation is attempted on an unregistered strategy
    error StrategyNotRegistered();

    /// @notice Emitted when an strategy is registered
    /// @param moduleImplId The ID of the module implementation
    /// @param strategy The address of the strategy
    /// @param minVersion Min compatible module implementation version. Disabled if 0.
    /// @param maxVersion Max compatible module implementation version. Disabled if 0.
    event StrategyRegistered(bytes32 moduleImplId, address strategy, uint120 minVersion, uint120 maxVersion);

    /// @notice Emitted when an strategy is unregistered
    /// @param moduleImplId The ID of the module implementation
    /// @param strategy The address of the unregistered strategy
    event StrategyUnregistered(bytes32 moduleImplId, address strategy);

    /// @notice Emitted when a min compatible module implementation version is set
    /// @param moduleImplId The ID of the module implementation
    /// @param strategy The address of the strategy
    /// @param minVersion Min compatible module implementation version. Disabled if 0.
    event MinCompatibleVersionSet(bytes32 moduleImplId, address strategy, uint120 minVersion);

    /// @notice Emitted when a max compatible module implementation version is set
    /// @param moduleImplId The ID of the module implementation
    /// @param strategy The address of the strategy
    /// @param maxVersion Max compatible module implementation version. Disabled if 0.
    event MaxCompatibleVersionSet(bytes32 moduleImplId, address strategy, uint120 maxVersion);

    /// @notice Determine if an strategy is valid for a given module implementation
    /// @param _moduleImplId The ID of the module implementation
    /// @param _moduleImplVersion The module implementation version
    /// @param _strategy The address of the strategy contract
    function isValidStrategy(
        bytes32 _moduleImplId,
        uint256 _moduleImplVersion,
        address _strategy
    ) external returns (bool);
}
