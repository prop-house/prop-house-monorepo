// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Asset } from '../lib/types/Common.sol';

/// @notice Interface implemented by the timed round
interface ITimedRound {
    /// @notice All possible round states
    enum RoundState {
        Active,
        Cancelled,
        Finalized
    }

    /// @notice The timed round configuration
    struct RoundConfig {
        Asset[] awards;
        uint248 proposalThreshold;
        uint256[] proposingStrategies;
        uint256[] proposingStrategyParamsFlat;
        uint256[] votingStrategies;
        uint256[] votingStrategyParamsFlat;
        uint40 proposalPeriodStartTimestamp;
        uint40 proposalPeriodDuration;
        uint40 votePeriodDuration;
        uint16 winnerCount;
    }

    /// @notice Thrown when cancellation is attempted and the round is not active
    error CANCELLATION_NOT_AVAILABLE();

    /// @notice Thrown when finalization is attempted and the round is not active
    error FINALIZATION_NOT_AVAILABLE();

    /// @notice Thrown when asset reclamation is not available
    error RECLAMATION_NOT_AVAILABLE();

    /// @notice Thrown when the remaining proposal period is too short
    error REMAINING_PROPOSAL_PERIOD_DURATION_TOO_SHORT();

    /// @notice Thrown when the vote period duration is too short
    error VOTE_PERIOD_DURATION_TOO_SHORT();

    /// @notice Thrown when the award length is greater than one and does not match the winner count
    error AWARD_LENGTH_MISMATCH();

    /// @notice Thrown when one award is split between winners and the amount is not a multiple of the winner count
    error AWARD_AMOUNT_NOT_MULTIPLE_OF_WINNER_COUNT();

    /// @notice Thrown when the winner count is zero or greater than the maximum allowable
    error WINNER_COUNT_OUT_OF_RANGE();

    /// @notice Thrown when the proposal threshold is non-zero and no proposing strategies are provided
    error NO_PROPOSING_STRATEGIES_PROVIDED();

    /// @notice Thrown when no voting strategies are provided
    error NO_VOTING_STRATEGIES_PROVIDED();

    /// @notice Emitted when the round is registered on L2
    /// @param awards The awards offered to round winners
    /// @param proposalThreshold The proposal threshold
    /// @param proposingStrategies The proposing strategy addresses
    /// @param proposingStrategyParamsFlat The flattened proposing strategy params
    /// @param votingStrategies The voting strategy addresses
    /// @param votingStrategyParamsFlat The flattened voting strategy params
    /// @param proposalPeriodStartTimestamp The timestamp at which the proposal period starts
    /// @param proposalPeriodDuration The proposal period duration in seconds
    /// @param votePeriodDuration The vote period duration in seconds
    /// @param winnerCount The number of possible winners
    event RoundRegistered(
        Asset[] awards,
        uint248 proposalThreshold,
        uint256[] proposingStrategies,
        uint256[] proposingStrategyParamsFlat,
        uint256[] votingStrategies,
        uint256[] votingStrategyParamsFlat,
        uint40 proposalPeriodStartTimestamp,
        uint40 proposalPeriodDuration,
        uint40 votePeriodDuration,
        uint16 winnerCount
    );

    /// @notice Emitted when the round is finalized
    event RoundFinalized();

    /// @notice Emitted when a round is cancelled by the round manager
    event RoundCancelled();

    /// @notice The current state of the timed round
    function state() external view returns (RoundState);

    /// @notice The timestamp at which the round was finalized. `0` if not finalized.
    function roundFinalizedAt() external view returns (uint40);

    /// @notice The timestamp at which the proposal period starts. `0` when in pending state.
    function proposalPeriodStartTimestamp() external view returns (uint40);

    /// @notice The proposal period duration in seconds. `0` when in pending state.
    function proposalPeriodDuration() external view returns (uint40);

    /// @notice The vote period duration in seconds. `0` when in pending state.
    function votePeriodDuration() external view returns (uint40);

    /// @notice The number of possible winners. `0` when in pending state.
    function winnerCount() external view returns (uint16);
}
