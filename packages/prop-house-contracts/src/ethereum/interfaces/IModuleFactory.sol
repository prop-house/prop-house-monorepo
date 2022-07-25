// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface for the Module Factory
interface IModuleFactory {
    /// @notice Thrown when an implementation contract has not been registered as a deployment target
    error InvalidDeploymentTarget();

    /// @notice Emitted when a module instance is created
    event ModuleInstanceCreated(address indexed implementation, address indexed instance);
}
