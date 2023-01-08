// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Asset } from '../lib/types/Common.sol';

/// @notice Interface implemented by the award router
interface IAwardRouter {
    /// @notice Thrown when an insufficient amount of ether is provided to `msg.value`
    error INSUFFICIENT_ETHER_SUPPLIED();

    /// @notice Thrown when a provided house is invalid
    error INVALID_HOUSE();

    /// @notice Thrown when a provided house strategy is invalid
    error INVALID_HOUSE_STRATEGY();

    /// @notice Thrown when a house attempts to pull tokens from a user who has not approved it
    error HOUSE_NOT_APPROVED_BY_USER();

    /// @notice Pull an asset from a user to the provided house strategy
    /// @param user The user to pull from
    /// @param strategy The receiving house strategy address
    /// @param asset The asset to transfer to the strategy
    /// @dev This function is only callable by a user-approved house
    function pullTo(
        address user,
        address payable strategy,
        Asset calldata asset
    ) external payable;

    /// @notice Pull many assets from a user to the provided house strategy
    /// @param user The user to pull from
    /// @param strategy The receiving house strategy address
    /// @param assets The assets to transfer to the strategy
    /// @dev This function is only callable by a user-approved house
    function batchPullTo(
        address user,
        address payable strategy,
        Asset[] calldata assets
    ) external payable;
}
