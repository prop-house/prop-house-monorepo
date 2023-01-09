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

    /// @notice Updates a house approval for the caller
    /// @param house The house address
    /// @param approved Whether the user is adding or removing approval
    function setApprovalForHouse(address house, bool approved) external;

    /// @notice Sets approval for a house given an EIP-712 signature
    /// @param user The user to approve the house for
    /// @param house The house to approve
    /// @param approved A boolean, whether or not to approve a house
    /// @param deadline The deadline at which point the given signature expires
    /// @param v The 129th byte and chain ID of the signature
    /// @param r The first 64 bytes of the signature
    /// @param s Bytes 64-128 of the signature
    function setApprovalForHouseBySig(
        address user,
        address house,
        bool approved,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}
