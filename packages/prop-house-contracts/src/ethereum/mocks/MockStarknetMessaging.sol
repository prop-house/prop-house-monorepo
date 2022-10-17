// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import './StarknetMessaging.sol';

contract MockStarknetMessaging is StarknetMessaging {
    error InvalidMessageToConsume();

    /// @notice Mocks a message from L2 to L1
    function mockSendMessageFromL2(
        uint256 from_address,
        uint256 to_address,
        uint256[] calldata payload
    ) external {
        bytes32 msgHash = keccak256(abi.encodePacked(from_address, to_address, payload.length, payload));
        l2ToL1Messages()[msgHash] += 1;
    }

    /// @notice Mocks consumption of a message from L1 to L2
    function mockConsumeMessageToL2(
        uint256 from_address,
        uint256 to_address,
        uint256 selector,
        uint256[] calldata payload,
        uint256 nonce
    ) external {
        bytes32 msgHash = keccak256(
            abi.encodePacked(from_address, to_address, nonce, selector, payload.length, payload)
        );

        if (l1ToL2Messages()[msgHash] == 0) {
            revert InvalidMessageToConsume();
        }
        l1ToL2Messages()[msgHash] -= 1;
    }
}
