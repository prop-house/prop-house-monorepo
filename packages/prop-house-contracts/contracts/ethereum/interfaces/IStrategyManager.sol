// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @notice Interface for the Strategy Manager
interface IStrategyManager {
    /// @notice Thrown when an operation is attempted on an unregistered strategy
    error STRATEGY_NOT_REGISTERED();

    /// @notice Emitted when an strategy is registered
    /// @param houseImplId The ID of the house implementation
    /// @param strategy The address of the strategy
    /// @param minVersion Min compatible house implementation version. Disabled if 0.
    /// @param maxVersion Max compatible house implementation version. Disabled if 0.
    event StrategyRegistered(bytes32 houseImplId, address strategy, uint120 minVersion, uint120 maxVersion);

    /// @notice Emitted when an strategy is unregistered
    /// @param houseImplId The ID of the house implementation
    /// @param strategy The address of the unregistered strategy
    event StrategyUnregistered(bytes32 houseImplId, address strategy);

    /// @notice Emitted when a min compatible house implementation version is set
    /// @param houseImplId The ID of the house implementation
    /// @param strategy The address of the strategy
    /// @param minVersion Min compatible house implementation version. Disabled if 0.
    event MinCompatibleVersionSet(bytes32 houseImplId, address strategy, uint120 minVersion);

    /// @notice Emitted when a max compatible house implementation version is set
    /// @param houseImplId The ID of the house implementation
    /// @param strategy The address of the strategy
    /// @param maxVersion Max compatible house implementation version. Disabled if 0.
    event MaxCompatibleVersionSet(bytes32 houseImplId, address strategy, uint120 maxVersion);

    /// @notice Determine if an strategy is valid for a given house implementation
    /// @param houseImplId The ID of the house implementation
    /// @param houseImplVersion The house implementation version
    /// @param strategy The address of the strategy contract
    function isValidStrategy(
        bytes32 houseImplId,
        uint256 houseImplVersion,
        address strategy
    ) external returns (bool);
}
