// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

interface IStarknetMessaging {
    /// @notice An event that is raised when a message is sent from L2 to L1
    event LogMessageToL1(uint256 indexed fromAddress, address indexed toAddress, uint256[] payload);

    /// @notice An event that is raised when a message is sent from L1 to L2
    event LogMessageToL2(
        address indexed fromAddress,
        uint256 indexed toAddress,
        uint256 indexed selector,
        uint256[] payload,
        uint256 nonce,
        uint256 fee
    );

    /// @notice An event that is raised when a message from L2 to L1 is consumed
    event ConsumedMessageToL1(uint256 indexed fromAddress, address indexed toAddress, uint256[] payload);

    /// @notice An event that is raised when a message from L1 to L2 is consumed
    event ConsumedMessageToL2(
        address indexed fromAddress,
        uint256 indexed toAddress,
        uint256 indexed selector,
        uint256[] payload,
        uint256 nonce
    );

    /// @notice Sends a message to an L2 contract and returns the hash of the message
    function sendMessageToL2(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload
    ) external payable returns (bytes32, uint256);

    /// @notice Consumes a message that was sent from an L2 contract and returns the hash of the message
    function consumeMessageFromL2(uint256 fromAddress, uint256[] calldata payload) external returns (bytes32);
}
