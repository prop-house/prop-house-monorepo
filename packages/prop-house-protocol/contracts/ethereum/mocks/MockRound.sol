// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IRound } from '../interfaces/IRound.sol';

contract MockRound is IRound {
    bytes32 public immutable kind;
    address public house;
    uint256 public id;

    constructor(bytes32 _kind) {
        kind = _kind;
    }

    function initialize(bytes calldata) external payable {}

    function supportsInterface(bytes4) external pure override returns (bool) {
        return false;
    }
}
