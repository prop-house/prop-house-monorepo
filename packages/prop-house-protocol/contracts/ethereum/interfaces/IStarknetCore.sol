// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

interface IStarknetCore {
    /// @notice Send a message to an L2 contract and return the hash of the message
    /// @param toAddress The callee address
    /// @param selector The function selector
    /// @param payload The message payload
    function sendMessageToL2(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload
    ) external payable returns (bytes32);

    /// @notice Starts the cancellation of an L1 to L2 message
    /// @param toAddress The callee address
    /// @param selector The function selector
    /// @param payload The message payload
    /// @param nonce The message nonce
    function startL1ToL2MessageCancellation(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload,
        uint256 nonce
    ) external;

    /// @notice Cancels an L1 to L2 message, this function should be called messageCancellationDelay() seconds
    /// after the call to startL1ToL2MessageCancellation()
    /// @param selector The function selector
    /// @param payload The message payload
    /// @param nonce The message nonce
    function cancelL1ToL2Message(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload,
        uint256 nonce
    ) external;

    /// @notice Consume a message that was sent from an L2 contract and return the hash of the message
    /// @param fromAddress The caller address
    /// @param payload The message payload
    function consumeMessageFromL2(uint256 fromAddress, uint256[] calldata payload) external returns (bytes32);
}
