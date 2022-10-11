// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { Math } from '@openzeppelin/contracts/utils/math/Math.sol';
import { ISpendingLimitEnabledVault } from '../interfaces/ISpendingLimitEnabledVault.sol';
import { Vault } from './Vault.sol';

contract SpendingLimitEnabledVault is ISpendingLimitEnabledVault, Vault {
    /// @notice Depositor spending limits by token address
    /// @dev Depositor => Operator => Token Address => Spending Limit
    mapping(address => mapping(address => mapping(address => uint256))) private _tokenSpendingLimits;

    // prettier-ignore
    /// @notice Depositor spending limits by token address and ID
    /// @dev Depositor => Operator => Token Address => Token ID => Is Approved To Spend
    mapping(address => mapping(address => mapping(address => mapping(uint256 => bool)))) private _isApprovedToSpendTokenId;

    /// @notice Returns the remaining number of tokens that `operator` will be
    /// allowed to spend on behalf of `depositor`.
    /// @param depositor The depositor, who deposited the `token`
    /// @param operator The operator, who can use `token` in an internal action
    /// @param token The token address
    function tokenSpendingLimit(
        address depositor,
        address operator,
        address token
    ) public view returns (uint256) {
        return _tokenSpendingLimits[depositor][operator][token];
    }

    /// @notice Returns if the `operator` is allowed to spend the `token` with `tokenId`
    /// on behalf of `depositor`.
    /// @param depositor The depositor, who deposited `token` with `tokenId`
    /// @param operator The operator, who can use the `token` with `tokenId` in an internal action
    /// @param token The token address
    /// @param tokenId The token ID
    function isApprovedToSpendTokenId(
        address depositor,
        address operator,
        address token,
        uint256 tokenId
    ) public view returns (bool) {
        return _isApprovedToSpendTokenId[depositor][operator][token][tokenId];
    }

    /// @notice Sets `value` as the spending limit of `operator` over the caller's tokens
    /// @param operator The operator, who can use `token` in an internal action
    /// @param token The token address
    /// @param newValue The new spending limit
    function setTokenSpendingLimit(
        address operator,
        address token,
        uint256 newValue
    ) external returns (bool) {
        address depositor = msg.sender;
        _setTokenSpendingLimit(depositor, operator, token, newValue);
        return true;
    }

    /// @notice Increases the spending limit over the caller's address by `addedValue`
    /// @param operator The operator, who can use `token` in an internal action
    /// @param token The token address
    /// @param addedValue The value to add to the existing spending limit
    function increaseTokenSpendingLimit(
        address operator,
        address token,
        uint256 addedValue
    ) external returns (bool) {
        address depositor = msg.sender;
        _setTokenSpendingLimit(depositor, operator, token, tokenSpendingLimit(depositor, operator, token) + addedValue);
        return true;
    }

    /// @notice Decreases the spending limit over the caller's address by `subtractedValue`
    /// @param operator The operator, who can use `token` in an internal action
    /// @param token The token address
    /// @param subtractedValue The value to subtract from the existing spending limit
    function decreaseTokenSpendingLimit(
        address operator,
        address token,
        uint256 subtractedValue
    ) external returns (bool) {
        address depositor = msg.sender;
        uint256 currentSpendingLimit = tokenSpendingLimit(depositor, operator, token);
        if (subtractedValue > currentSpendingLimit) {
            revert DecreasedSpendingLimitBelowZero();
        }
        unchecked {
            _setTokenSpendingLimit(depositor, operator, token, currentSpendingLimit - subtractedValue);
        }
        return true;
    }

    /// @notice Approve or remove `operator`s ability to spend `token` with `tokenId`
    /// @param operator The operator, who can use the `token` with `tokenId` in an internal action
    /// @param token The token address
    /// @param tokenId The token ID
    /// @param isApproved Whether `operator` is approved to spend `token` with `tokenId`
    function setTokenIdApproval(
        address operator,
        address token,
        uint256 tokenId,
        bool isApproved
    ) external returns (bool) {
        _setTokenIdApproval(msg.sender, operator, token, tokenId, isApproved);
        return true;
    }

    /// @notice Credits the spending limit of a operator for an depositor's token
    /// @param operator The operator, who can use the `token` in an internal action
    /// @param depositor The depositor, who deposited the `token`
    /// @param token The token address
    /// @param value The value to credit
    function _creditSpendingLimit(
        address depositor,
        address operator,
        address token,
        uint256 value
    ) internal virtual {
        uint256 currentSpendingLimit = tokenSpendingLimit(depositor, operator, token);
        if (currentSpendingLimit != type(uint256).max) {
            uint256 maxAcceptableAmount = type(uint256).max - currentSpendingLimit;
            unchecked {
                _setTokenSpendingLimit(
                    depositor,
                    operator,
                    token,
                    currentSpendingLimit + Math.min(value, maxAcceptableAmount)
                );
            }
        }
    }

    /// @notice Debits the spending limit of a operator for an depositor's token
    /// @param operator The operator, who can use the `token` in an internal action
    /// @param depositor The depositor, who deposited the `token`
    /// @param token The token address
    /// @param value The value to debit
    function _debitSpendingLimit(
        address depositor,
        address operator,
        address token,
        uint256 value
    ) internal virtual {
        uint256 currentSpendingLimit = tokenSpendingLimit(depositor, operator, token);
        if (currentSpendingLimit != type(uint256).max) {
            if (currentSpendingLimit < value) {
                revert InsufficientSpendingLimit();
            }
            unchecked {
                _setTokenSpendingLimit(depositor, operator, token, currentSpendingLimit - value);
            }
        }
    }

    /// @notice Sets `value` as the spending limit of `operator` over the depositor's tokens
    /// @param depositor The depositor, who deposited the `token`
    /// @param operator The operator, who can use `token` in an internal action
    /// @param token The token address
    /// @param value The new spending limit
    function _setTokenSpendingLimit(
        address depositor,
        address operator,
        address token,
        uint256 value
    ) internal {
        if (depositor == address(0)) {
            revert DepositorIsZeroAddress();
        }
        if (operator == address(0)) {
            revert OperatorIsZeroAddress();
        }
        _tokenSpendingLimits[depositor][operator][token] = value;
        emit TokenSpendingLimitSet(depositor, operator, token, value);
    }

    /// @notice Approve or remove `operator`s ability to spend `token` with `tokenId`
    /// @param depositor The depositor, who deposited `token` with `tokenId`†
    /// @param operator The operator, who can use the `token` with `tokenId` in an internal action
    /// @param token The token address
    /// @param tokenId The token ID
    /// @param isApproved Whether `operator` is approved to spend `token` with `tokenId`
    function _setTokenIdApproval(
        address depositor,
        address operator,
        address token,
        uint256 tokenId,
        bool isApproved
    ) internal {
        if (depositor == address(0)) {
            revert DepositorIsZeroAddress();
        }
        if (operator == address(0)) {
            revert OperatorIsZeroAddress();
        }
        _isApprovedToSpendTokenId[depositor][operator][token][tokenId] = isApproved;
        emit TokenIdApprovalSet(depositor, operator, token, tokenId, isApproved);
    }
}
