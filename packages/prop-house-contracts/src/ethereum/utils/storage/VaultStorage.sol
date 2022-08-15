// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

contract VaultStorage {
    /// @notice Available asset balances
    /// @dev Account => Asset ID => Balance
    mapping(address => mapping(bytes32 => uint256)) internal _balances;
}
