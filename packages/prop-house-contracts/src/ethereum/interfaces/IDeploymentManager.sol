// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface for the Deployment Manager
interface IDeploymentManager {
    /// @notice Emitted when a deployment target is registered
    /// @param impl The address of the registered deployment target
    event DeploymentTargetRegistered(address impl);

    /// @notice Emitted when a deployment target is unregistered
    /// @param impl The address of the unregistered deployment target
    event DeploymentTargetUnregistered(address impl);

    /// @notice Determine if a deployment target is valid
    /// @param _impl The address of the target implementation
    function isValidDeploymentTarget(address _impl) external returns (bool);
}
