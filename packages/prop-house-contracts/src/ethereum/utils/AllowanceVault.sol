// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { Vault } from './Vault.sol';

// TODO: Make it clear that these are INTERNAL spending limits. You cannot withdraw.
contract AllowanceVault is Vault {
    error InsufficientSpendingLimit();
    error DecreasedSpendingLimitBelowZero();
    error OwnerIsZeroAddress();
    error SpenderIsZeroAddress();

    /// @notice Depositor asset spending limits
    /// @dev Depositor => Spender => Asset Address => Spending Limit
    mapping(address => mapping(address => mapping(address => uint256))) private _spendingLimits;

    function spendingLimit(
        address owner,
        address spender,
        address asset
    ) public view returns (uint256) {
        return _spendingLimits[owner][spender][asset];
    }

    function increaseSpendingLimit(
        address spender,
        address token,
        uint256 addedValue
    ) external returns (bool) {
        address owner = msg.sender;
        _setSpendingLimit(owner, spender, token, spendingLimit(owner, spender, token) + addedValue);
        return true;
    }

    function decreaseSpendingLimit(
        address spender,
        address token,
        uint256 subtractedValue
    ) external returns (bool) {
        address owner = msg.sender;
        uint256 currentSpendingLimit = spendingLimit(owner, spender, token);
        if (subtractedValue > currentSpendingLimit) {
            revert DecreasedSpendingLimitBelowZero();
        }
        unchecked {
            _setSpendingLimit(owner, spender, token, currentSpendingLimit - subtractedValue);
        }

        return true;
    }

    function _creditInternalSpendingLimit(
        address owner,
        address spender,
        address token,
        uint256 amount
    ) internal virtual {
        uint256 currentSpendingLimit = spendingLimit(owner, spender, token);
        if (currentSpendingLimit != type(uint256).max) {
            unchecked {
                _setSpendingLimit(owner, spender, token, currentSpendingLimit + amount);
            }
        }
    }

    function _debitInternalSpendingLimit(
        address owner,
        address spender,
        address token,
        uint256 amount
    ) internal virtual {
        uint256 currentSpendingLimit = spendingLimit(owner, spender, token);
        if (currentSpendingLimit != type(uint256).max) {
            if (currentSpendingLimit < amount) {
                revert InsufficientSpendingLimit();
            }
            unchecked {
                _setSpendingLimit(owner, spender, token, currentSpendingLimit - amount);
            }
        }
    }

    function _setSpendingLimit(
        address owner,
        address spender,
        address token,
        uint256 amount
    ) internal {
        if (owner == address(0)) {
            revert OwnerIsZeroAddress();
        }
        if (spender == address(0)) {
            revert SpenderIsZeroAddress();
        }
        _spendingLimits[owner][spender][token] = amount;
    }
}
