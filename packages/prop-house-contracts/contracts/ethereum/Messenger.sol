// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IStarknetCore } from './interfaces/IStarknetCore.sol';
import { IMessenger } from './interfaces/IMessenger.sol';
import { IPropHouse } from './interfaces/IPropHouse.sol';
import { Uint256 } from './lib/utils/Uint256.sol';

contract Messenger is IMessenger {
    using { Uint256.toUint256 } for address;

    /// @notice The Starknet Core contract
    IStarknetCore public immutable starknet;

    /// @notice The Prop House contract
    IPropHouse public immutable propHouse;

    /// @notice Require that the caller is a valid round
    modifier onlyRound() {
        if (!propHouse.isRound(msg.sender)) {
            revert ONLY_ROUND();
        }
        _;
    }

    /// @param _starknet The Starknet core contract address
    /// @param _propHouse The Prop House contract address
    constructor(address _starknet, address _propHouse) {
        starknet = IStarknetCore(_starknet);
        propHouse = IPropHouse(_propHouse);
    }

    /// @notice Send a message to an L2 contract and return the hash of the message
    /// @param toAddress The callee address
    /// @param selector The function selector
    /// @param payload The message payload
    function sendMessageToL2(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload
    ) external onlyRound returns (bytes32) {
        return starknet.sendMessageToL2(toAddress, selector, _insertCaller(payload));
    }

    /// @notice Starts the cancellation of an L1 to L2 message
    /// @param toAddress The callee address
    /// @param selector The function selector
    /// @param payload The message payload
    /// @param nonce The message cancellation nonce
    function startL1ToL2MessageCancellation(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload,
        uint256 nonce
    ) external onlyRound {
        return starknet.startL1ToL2MessageCancellation(toAddress, selector, _insertCaller(payload), nonce);
    }

    /// @notice Cancels an L1 to L2 message, this function should be called `messageCancellationDelay` seconds
    /// after the call to startL1ToL2MessageCancellation()
    /// @param selector The function selector
    /// @param payload The message payload
    /// @param nonce The message cancellation nonce
    function cancelL1ToL2Message(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload,
        uint256 nonce
    ) external onlyRound {
        return starknet.cancelL1ToL2Message(toAddress, selector, _insertCaller(payload), nonce);
    }

    /// @notice Insert the `msg.sender` address to the first index of the payload.
    /// This is used to prevent spoofing in the event of a malicious registrar.
    /// @param payload The message payload
    function _insertCaller(uint256[] memory payload) internal view returns (uint256[] memory) {
        payload[0] = msg.sender.toUint256();
        return payload;
    }
}
