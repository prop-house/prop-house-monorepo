// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IRound } from './IRound.sol';

/// @notice Interface that must be implemented by all rounds that issue receipts
interface IReceiptIssuer is IRound {
    /// @notice Issue a deposit receipt to the provided `to` address
    function issueReceipt(
        address to,
        uint256 id,
        uint256 amount
    ) external;

    /// @notice Batch issue one or more deposit receipts to the provided `to` address
    function issueReceipts(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external;
}
