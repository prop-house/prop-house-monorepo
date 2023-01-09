// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @notice Interface for the House Factory
interface IHouseFactory {
    /// @notice Thrown when an implementation contract has not been registered as a deployment target
    error INVALID_DEPLOYMENT_TYPE();

    /// @notice Emitted when a house is created
    event HouseCreated(address indexed implementation, address indexed house);

    /// @notice Determine if the passed address is a valid house
    /// @param addr The address to check
    function isHouse(address addr) external view returns (bool);
}
