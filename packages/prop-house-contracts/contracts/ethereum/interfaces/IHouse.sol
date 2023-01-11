// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @notice Common interface for a house
interface IHouse {
    /// @notice ECDSA signature values
    struct Signature {
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    /// @notice Thrown when a strategy is not enabled in the house instance
    error STRATEGY_NOT_ENABLED();

    /// @notice Thrown when the caller of a guarded function is not a valid house strategy
    error ONLY_HOUSE_STRATEGY();

    /// @notice Emitted when the contract URI is updated
    /// @param contractURI The new contract URI
    event ContractURIUpdated(string contractURI);

    /// @notice Emitted when a house strategy is enabled
    /// @param strategy The address of the enabled strategy
    event StrategyEnabled(address strategy);

    /// @notice Emitted when a house strategy is disabled
    /// @param strategy The address of the disabled strategy
    event StrategyDisabled(address strategy);

    /// @notice The house implementation contract identifier
    function id() external view returns (bytes32);

    /// @notice The house implementation contract version
    function version() external view returns (uint256);

    /// @notice Initialize the house
    /// @param creator The creator of the house
    /// @param data Initialization data
    function initialize(address creator, bytes calldata data) external;

    /// @notice Enable a house strategy
    function enableStrategy(address strategy) external;

    /// @notice Disable a house strategy
    function disableStrategy(address strategy) external;

    /// @notice Enable many house strategies
    function enableManyStrategies(address[] calldata strategies) external;

    /// @notice Disable many house strategies
    function disableManyStrategies(address[] calldata strategies) external;

    /// @notice Returns `true` if the provided address is a valid house strategy
    /// @param strategy The house strategy to validate
    function isValidHouseStrategy(address strategy) external view returns (bool);

    /// @notice Forwards a cross-chain message from a house strategy to the Starknet messenger contract
    /// and returns the hash of the message
    /// @param toAddress The callee address
    /// @param selector The function selector
    /// @param payload The message payload
    function forwardMessageToL2(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload
    ) external returns (bytes32);
}
