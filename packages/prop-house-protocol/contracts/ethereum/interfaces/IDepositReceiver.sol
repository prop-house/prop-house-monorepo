// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IRound } from './IRound.sol';

/// @notice Interface that can be implemented by rounds that receive deposits
interface IDepositReceiver is IRound {
    /// @notice A callback that is called when a deposit is received
    function onDepositReceived(address depositor, uint256 id, uint256 amount) external;

    /// @notice A callback that is called when a batch of deposits is received
    function onDepositsReceived(address depositor, uint256[] calldata ids, uint256[] calldata amounts) external;
}
