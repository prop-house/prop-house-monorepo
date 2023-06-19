// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IHouse } from '../interfaces/IHouse.sol';
import { ERC721 } from '../lib/token/ERC721.sol';

contract MockHouse is IHouse, ERC721 {
    bytes32 public immutable kind;

    constructor(bytes32 _kind) ERC721('MockHouse', 'MOCK') {
        kind = _kind;
    }

    function initialize(bytes calldata) external {}

    function isRound(address) external pure returns (bool) {
        return true;
    }

    function createRound(address, string calldata, address) external pure returns (address) {
        return address(0);
    }
}
