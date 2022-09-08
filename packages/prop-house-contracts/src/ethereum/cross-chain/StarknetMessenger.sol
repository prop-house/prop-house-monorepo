// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IStarknetCore } from '../interfaces/IStarknetCore.sol';
import { IHouseFactory } from '../interfaces/IHouseFactory.sol';
import { IStarknetMessenger } from '../interfaces/IStarknetMessenger.sol';

contract StarknetMessenger is IStarknetMessenger {
    /// @notice The Starknet Core contract
    IStarknetCore public immutable starknet;

    /// @notice The House Factory contract
    IHouseFactory public immutable factory;

    constructor(IStarknetCore _starknet, IHouseFactory _factory) {
        starknet = _starknet;
        factory = _factory;
    }

    /// @notice Require that the sender is a valid house
    modifier onlyHouse() {
        if (!factory.isHouse(msg.sender)) {
            revert OnlyHouse();
        }
        _;
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

    // TODO: How do we want to handle consumption? Does it require `onlyHouse`?

    /// @notice Consume a message that was sent from an L2 contract and return the hash of the message
    /// @param fromAddress The caller address
    /// @param payload The message payload
    function consumeMessageFromL2(uint256 fromAddress, uint256[] calldata payload) external returns (bytes32) {
        return starknet.consumeMessageFromL2(fromAddress, payload);
    }

    // TODO: Migrate the bridge contract for all houses moving forward?

    // TODO: Cheapest way to validate that a house is the caller?
    // Would be great to avoid pushing each house address to storage...
}
