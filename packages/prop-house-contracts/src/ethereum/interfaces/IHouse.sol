// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Common interface for a house
interface IHouse {
    /// @notice Thrown when an upgrade has not been registered for an implementation contract
    error InvalidUpgrade();

    /// @notice Thrown when a strategy is not enabled in the house instance
    error StrategyNotEnabled();

    /// @notice Emitted when a house strategy is enabled
    /// @param strategy The address of the enabled strategy
    event StrategyEnabled(address strategy);

    /// @notice Emitted when a house strategy is disabled
    /// @param strategy The address of the disabled strategy
    event StrategyDisabled(address strategy);

    /// @notice The string representation of the unique identifier
    function name() external view returns (string memory);

    /// @notice A unique identifier
    function id() external view returns (bytes32);

    /// @notice The house implementation contract version
    function version() external view returns (uint256);

    /// @notice Initialize the house
    /// @param creator The creator of the house
    /// @param data Initialization data
    function initialize(address creator, bytes calldata data) external payable;

    /// @notice Enable a house strategy
    function enableStrategy(address strategy) external;

    /// @notice Disable a house strategy
    function disableStrategy(address strategy) external;

    /// @notice Enable many house strategies
    function enableManyStrategies(address[] calldata strategies) external;

    /// @notice Disable many house strategies
    function disableManyStrategies(address[] calldata strategies) external;
}
