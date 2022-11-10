// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IFundingHouse } from '../interfaces/IFundingHouse.sol';

abstract contract FundingHouseStorageV1 {
    /// @notice The id of the latest round
    /// @dev If 0, no rounds have been initiated
    uint256 public roundId;

    /// @notice Funding round information
    /// @dev Round ID => Round Information
    mapping(uint256 => IFundingHouse.Round) public rounds;

    /// @notice Determine if a round imitiator has been whitelisted
    /// @dev Round Initiator Address => Is Whitelisted
    mapping(address => bool) public isRoundInitiatorWhitelisted;

    /// @notice Determine if a voting strategy configuration is whitelisted
    /// @dev Masked Voting Strategy & Params Hash => Is Whitelisted
    mapping(uint256 => bool) public isVotingStrategyWhitelisted;

    /// @notice Determine if a proposer has claimed their award
    /// @dev Round ID => Proposal ID => Is Claimed
    mapping(uint256 => mapping(uint256 => bool)) public isAwardClaimed;
}
