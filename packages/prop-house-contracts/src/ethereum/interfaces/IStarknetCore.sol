// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

interface IStarknetCore {
    /// @notice Send a message to an L2 contract and return the hash of the message
    /// @param toAddress The callee address
    /// @param selector The function selector
    /// @param payload The message payload
    function sendMessageToL2(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload
    ) external returns (bytes32);

    /// @notice Consume a message that was sent from an L2 contract and return the hash of the message
    /// @param fromAddress The caller address
    /// @param payload The message payload
    function consumeMessageFromL2(uint256 fromAddress, uint256[] calldata payload) external returns (bytes32);
}
