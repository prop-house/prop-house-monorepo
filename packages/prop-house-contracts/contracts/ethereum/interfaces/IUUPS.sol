// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IERC1822Proxiable } from '@openzeppelin/contracts/interfaces/draft-IERC1822.sol';
import { IERC1967Upgrade } from './IERC1967Upgrade.sol';

/// @title IUUPS
/// @notice The external UUPS errors and functions
interface IUUPS is IERC1967Upgrade, IERC1822Proxiable {
    /// @dev Thrown when not called directly
    error ONLY_CALL();

    /// @dev Thrown when not called via delegatecall
    error ONLY_DELEGATE_CALL();

    /// @dev Thrown when not called via proxy
    error ONLY_PROXY();

    /// @notice Upgrades to an implementation
    /// @param newImpl The new implementation address
    function upgradeTo(address newImpl) external;

    /// @notice Upgrades to an implementation with an additional function call
    /// @param newImpl The new implementation address
    /// @param data The encoded function call
    function upgradeToAndCall(address newImpl, bytes memory data) external payable;
}