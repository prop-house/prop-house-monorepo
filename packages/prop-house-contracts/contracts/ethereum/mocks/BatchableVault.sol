// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { Vault } from '../utils/Vault.sol';
import { Batchable } from '../utils/Batchable.sol';

contract BatchableVault is Vault, Batchable {
    constructor(address weth_) Vault(weth_) {}
}
