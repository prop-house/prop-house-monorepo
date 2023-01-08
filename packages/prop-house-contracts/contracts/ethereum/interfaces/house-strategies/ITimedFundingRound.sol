// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IHouseStrategy } from '../../interfaces/IHouseStrategy.sol';

/// @notice Interface implemented by the timed funding round house strategy
interface ITimedFundingRound is IHouseStrategy {
    /// @notice All possible round states
    enum RoundState {
        Pending,
        Active,
        Finalized,
        Cancelled
    }

    /// @notice The timed funding round house strategy configuration
    struct RoundConfig {
        uint40 proposalPeriodStartTimestamp;
        uint40 proposalPeriodDuration;
        uint40 votePeriodDuration;
        uint16 winnerCount;
        Award[] awards;
        // address parent; // TODO: Won't work if multiple awards...
    }

    // TODO: Move and rename `Award`. Maybe to `DepositAsset`, `OfferedAsset`, `LockedAsset`. locked asset is probably best.
    // This may be another round, so should generalize.

    /// @notice An award asset offered to one or more round winners
    struct Award {
        uint256 assetId;
        uint256 amount;
    }

    /// @notice Thrown when an award has already been claimed
    error AWARD_ALREADY_CLAIMED();

    /// @notice Thrown when the caller of a guarded function is not the award router
    error ONLY_AWARD_ROUTER();

    /// @notice Thrown when the caller of a guarded function is not the round's house
    error ONLY_HOUSE();

    /// @notice Thrown when the caller of a guarded function is not the round manager
    error ONLY_ROUND_MANAGER();

    /// @notice Thrown when the provided merkle proof is invalid
    error INVALID_MERKLE_PROOF();

    /// @notice Thrown when cancellation is attempted and the round is not active
    error CANCELLATION_NOT_AVAILABLE();

    /// @notice Thrown when finalization is attempted and the round is not active
    error FINALIZATION_NOT_AVAILABLE();

    /// @notice Thrown when award reclamation is not available
    error RECLAMATION_NOT_AVAILABLE();

    /// @notice Thrown when the full proposal period duration is too short
    error PROPOSAL_PERIOD_DURATION_TOO_SHORT();

    /// @notice Thrown when the remaining proposal period duration is too short
    error REMAINING_PROPOSAL_PERIOD_DURATION_TOO_SHORT();

    /// @notice Thrown when the vote period duration is too short
    error VOTE_PERIOD_DURATION_TOO_SHORT();

    /// @notice Thrown when the award length is invalid
    error INVALID_AWARD_LENGTH();

    /// @notice Thrown when the award amount is invalid
    error INVALID_AWARD_AMOUNT();

    /// @notice Thrown when the winner count is zero
    error WINNER_COUNT_CANNOT_BE_ZERO();

    /// @notice Thrown when the winner count is greater than the maximum allowable count
    error WINNER_COUNT_EXCEEDS_MAXIMUM();

    /// @notice Thrown when attempting to register a round that has already been registered on L2
    error ROUND_ALREADY_REGISTERED();

    /// @notice Thrown when the round has not received sufficient funding for the selected awards
    error INSUFFICIENT_ASSET_FUNDING();

    // TODO: `AwardClaimed` may be too specialized if the asset for one round is execution of another.

    /// @notice Emitted when an award is claimed
    /// @param proposalId The ID of the winning proposal
    /// @param winner The address of the winner
    /// @param assetId The ID of the asset being claimed
    /// @param amount The amount of `asset` being claimed
    /// @param recipient The recipient of the award
    event AwardClaimed(uint256 proposalId, address winner, uint256 assetId, uint256 amount, address recipient);

    /// @notice Emitted when an asset is reclaimed by a deposit credit holder
    /// @param recipient The asset recipient
    /// @param assetId The ID of the asset being reclaimed
    /// @param amount The amount of the asset being reclaimed
    event AssetReclaimed(address recipient, uint256 assetId, uint256 amount);

    /// @notice Emitted when the round registration is submitted to L2
    /// @param proposalPeriodStartTimestamp The timestamp at which the proposal period starts
    /// @param proposalPeriodDuration The proposal period duration in seconds
    /// @param votePeriodDuration The vote period duration in seconds
    /// @param winnerCount The number of possible winners
    /// @param awards The awards offered to winners
    event RoundRegistered(
        uint40 proposalPeriodStartTimestamp,
        uint40 proposalPeriodDuration,
        uint40 votePeriodDuration,
        uint16 winnerCount,
        Award[] awards
    );

    /// @notice Emitted when the round is finalized
    event RoundFinalized();

    /// @notice Emitted when a round is cancelled by the round manager
    event RoundCancelled();
}
