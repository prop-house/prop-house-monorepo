// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface for the Prop House Factory
interface IPropHouseFactory {
    /// @notice Thrown when an implementation contract has not been registered as a deployment target
    error InvalidDeploymentTarget();
}
