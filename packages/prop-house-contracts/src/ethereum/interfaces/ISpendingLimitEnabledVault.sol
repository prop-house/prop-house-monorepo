// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IVault } from './IVault.sol';

/// @notice Interface for the Spending-Limit-Enabled Vault
interface ISpendingLimitEnabledVault is IVault {
    /// @notice Thrown when the operator has an insufficient spending limit for the action
    error InsufficientSpendingLimit();

    /// @notice Thrown when the owner is attempting to decrease the spending limit below zero
    error DecreasedSpendingLimitBelowZero();

    /// @notice Thrown when the depositor is the zero address
    error DepositorIsZeroAddress();

    /// @notice Thrown when the operator is the zero address
    error OperatorIsZeroAddress();

    /// @notice Emitted when a token spending limit is set
    /// @param depositor The depositor, who deposited the `token`
    /// @param operator The operator, who can use `token` in an internal action
    /// @param token The token address
    /// @param value The new spending limit
    event TokenSpendingLimitSet(address indexed depositor, address indexed operator, address token, uint256 value);

    /// @notice Emitted when a token ID approval limit is set
    /// @param depositor The depositor, who deposited `token` with `tokenId`†
    /// @param operator The operator, who can use the `token` with `tokenId` in an internal action
    /// @param token The token address
    /// @param tokenId The token ID
    /// @param isApproved Whether `operator` is approved to spend `token` with `tokenId`
    event TokenIdApprovalSet(
        address indexed depositor,
        address indexed operator,
        address token,
        uint256 tokenId,
        bool isApproved
    );
}
