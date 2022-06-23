// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface for the Prop House
interface IPropHouse {
    /// @notice Thrown when an upgrade has not been registered for an implementation contract
    error InvalidUpgrade();

    /// @notice Initialize a prop house contract
    /// @param creator The creator of the prop house
    /// @param data Initialization data
    function initialize(address creator, bytes calldata data) external;
}
