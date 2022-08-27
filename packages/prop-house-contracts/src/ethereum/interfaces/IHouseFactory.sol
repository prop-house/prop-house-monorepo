// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface for the House Factory
interface IHouseFactory {
    /// @notice Thrown when an implementation contract has not been registered as a deployment target
    error InvalidDeploymentTarget();

    // TODO: Also emit house type...

    /// @notice Emitted when a house is created
    event HouseCreated(address indexed implementation, address indexed house);
}
