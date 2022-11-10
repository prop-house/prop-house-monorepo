// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

/// @notice Interface for the wrapped ETH token
interface IWETH is IERC20 {
    /// @notice Deposit ETH
    function deposit() external payable;

    /// @notice Withdraw ETH
    /// @param wad The withdrawal amount
    function withdraw(uint256 wad) external;
}
