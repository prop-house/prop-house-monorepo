// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

abstract contract FundingHouseStorageV1 {
    /// @notice The id of the latest round
    /// @dev If 0, no rounds have been initiated
    uint256 public roundId;

    /// @notice Determine if a round creator has been whitelisted
    /// @dev Round Creator Address => Is Whitelisted
    mapping(address => bool) public isRoundCreatorWhitelisted;

    /// @notice Determine if a voting strategy configuration is whitelisted
    /// @dev Masked Voting Strategy & Params Hash => Is Whitelisted
    mapping(uint256 => bool) public isVotingStrategyWhitelisted;
}
