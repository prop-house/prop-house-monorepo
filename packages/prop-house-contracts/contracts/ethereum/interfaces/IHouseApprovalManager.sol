// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

interface IHouseApprovalManager {
    /// @notice Thrown when a provided house is invalid
    error INVALID_HOUSE();

    /// @notice Thrown when the house approval signature is invalid
    error INVALID_SIGNATURE();

    /// @notice Thrown when the house approval signature has expired
    error EXPIRED_SIGNATURE();

    /// @notice Emitted when a user updates a house approval
    /// @param user The user address
    /// @param house The house address
    /// @param approved Whether the user added or removed approval
    event HouseApprovalSet(address indexed user, address indexed house, bool approved);

    /// @notice Determine if a user has given a house permission to pull assets
    /// @param user The user who is initiating the action
    /// @param house The house that is attempting to pull assets
    function isHouseApproved(address user, address house) external view returns (bool);
}
