// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IStarknetCore } from './interfaces/IStarknetCore.sol';
import { IHouseFactory } from './interfaces/IHouseFactory.sol';
import { IHouseStrategy } from './interfaces/IHouseStrategy.sol';
import { IStarknetMessenger } from './interfaces/IStarknetMessenger.sol';

contract StarknetMessenger is IStarknetMessenger {
    /// @notice The Starknet Core contract
    IStarknetCore public immutable starknet;

    /// @notice The House Factory contract
    IHouseFactory public immutable factory;

    /// @notice Require that the sender is a valid house
    modifier onlyHouse() {
        if (!factory.isHouse(msg.sender)) {
            revert ONLY_HOUSE();
        }
        _;
    }

    constructor(IStarknetCore _starknet, IHouseFactory _factory) {
        starknet = _starknet;
        factory = _factory;
    }

    /// @notice Send a message to an L2 contract and return the hash of the message
    /// @param toAddress The callee address
    /// @param selector The function selector
    /// @param payload The message payload
    function sendMessageToL2(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload
    ) external onlyHouse returns (bytes32) {
        return starknet.sendMessageToL2(toAddress, selector, payload);
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
    ) external onlyHouse {
        return starknet.startL1ToL2MessageCancellation(toAddress, selector, payload, nonce);
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
    ) external onlyHouse {
        return starknet.cancelL1ToL2Message(toAddress, selector, payload, nonce);
    }
}
