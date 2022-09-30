// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IFundingHouse } from '../houses/interfaces/IFundingHouse.sol';
import { Uint256Utils } from '../utils/Uint256Utils.sol';
import { IStrategy } from './interfaces/IStrategy.sol';

contract TimedFundingRoundStrategy is IStrategy {
    using { Uint256Utils.split } for uint256;
    using { Uint256Utils.toUint256 } for address;

    /// @notice Thrown when the proposal period start timestamp is not far enough in the future
    error ProposalPeriodStartTimestampTooSoon();

    /// @notice Thrown when the proposal period duration is too short
    error ProposalPeriodDurationTooShort();

    /// @notice Thrown when the vote period duration is too short
    error VotePeriodDurationTooShort();

    /// @notice Thrown when the award length is invalid
    error InvalidAwardLength();

    /// @notice Thrown when the award amount is invalid
    error InvalidAwardAmount();

    /// @notice Thrown when the winner count is greater than the maximum allowable count
    error WinnerCountTooHigh();

    /// @notice Thrown when an invalid number of voting strategies are provided
    error InvalidVotingStrategyLength();

    /// @notice The minimum time required between round initiation and the start of the proposal period
    uint256 public constant MIN_TIME_UNTIL_PROPOSAL_PERIOD = 2 hours;

    /// @notice The minimum proposal submission period duration
    uint256 public constant MIN_PROPOSAL_PERIOD_DURATION = 4 hours;

    /// @notice The minimum vote period duration
    uint256 public constant MIN_VOTE_PERIOD_DURATION = 4 hours;

    /// @notice Maximum winner count for this strategy
    uint256 public constant MAX_WINNER_COUNT = 256;

    /// @notice The hash of the target strategy contract code on Starknet
    uint256 public constant HOUSE_STRATEGY_CLASS_HASH = 450723475664937775680534560701408094262997602934084738341249781;

    /// @notice The timed funding round house strategy params
    struct TimedFundingRound {
        uint40 proposalPeriodStartTimestamp;
        uint40 proposalPeriodDuration;
        uint40 votePeriodDuration;
        uint16 winnerCount;
    }

    /// @notice Validate the timed funding round strategy `data` and return the L2 strategy class hash and params.
    /// This strategy supports two award strategies - A single award that's split equally between winners OR an
    /// array of awards equal in length to the number of winners, which can include varying assets and amounts.
    /// @param data The timed funding round config
    function getL2Payload(bytes calldata data) external view returns (uint256[] memory payload) {
        (
            ,
            uint256 roundId,
            bytes32 awardHash,
            bytes memory config,
            IFundingHouse.Award[] memory awards,
            uint256[] memory votingStrategies,
            uint256[] memory executionStrategies
        ) = abi.decode(data, (address, uint256, bytes32, bytes, IFundingHouse.Award[], uint256[], uint256[]));

        TimedFundingRound memory round = abi.decode(config, (TimedFundingRound));

        if (round.proposalPeriodStartTimestamp - MIN_TIME_UNTIL_PROPOSAL_PERIOD < block.timestamp) {
            revert ProposalPeriodStartTimestampTooSoon();
        }
        if (round.proposalPeriodDuration < MIN_PROPOSAL_PERIOD_DURATION) {
            revert ProposalPeriodDurationTooShort();
        }
        if (round.votePeriodDuration < MIN_VOTE_PERIOD_DURATION) {
            revert VotePeriodDurationTooShort();
        }
        if (awards.length != 1 && awards.length != round.winnerCount) {
            revert InvalidAwardLength();
        }
        if (awards.length == 1 && round.winnerCount > 1 && awards[0].amount % round.winnerCount != 0) {
            revert InvalidAwardAmount();
        }
        if (round.winnerCount > MAX_WINNER_COUNT) {
            revert WinnerCountTooHigh();
        }
        if (votingStrategies.length != 1) {
            revert InvalidVotingStrategyLength();
        }

        uint256 offset = 8;
        uint256 numVotingStrategies = votingStrategies.length;
        uint256 numExecutionStrategies = executionStrategies.length;

        payload = new uint256[](offset + 2 + numVotingStrategies + numExecutionStrategies);
        payload[0] = msg.sender.toUint256();
        payload[1] = HOUSE_STRATEGY_CLASS_HASH;

        // Strategy Params
        payload[2] = 7; // Strategy Params Length
        payload[3] = roundId;
        (payload[4], payload[5]) = uint256(awardHash).split();
        payload[6] = round.proposalPeriodStartTimestamp;
        payload[7] = round.proposalPeriodDuration;
        payload[8] = round.votePeriodDuration;
        payload[9] = round.winnerCount;

        unchecked {
            // Voting Strategies
            payload[offset++] = numVotingStrategies;
            for (uint256 i = 0; i < numVotingStrategies; ++i) {
                payload[offset++] = votingStrategies[i];
            }

            // Execution Strategies
            payload[offset++] = numExecutionStrategies;
            for (uint256 i = 0; i < numExecutionStrategies; ++i) {
                payload[offset++] = executionStrategies[i];
            }
        }
        return payload;
    }
}
