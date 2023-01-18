// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IFundingHouseStrategy } from '../../interfaces/IFundingHouseStrategy.sol';
import { Award } from '../../lib/types/Common.sol';

/// @notice Interface implemented by the timed funding round house strategy
interface ITimedFundingRound is IFundingHouseStrategy {
    /// @notice All possible round states
    enum RoundState {
        Pending,
        Active,
        Finalized,
        Cancelled
    }

    /// @notice Supported round execution types
    enum ExecutionType {
        MerkleProof
    }

    /// @notice The timed funding round house strategy configuration
    struct RoundConfig {
        uint40 proposalPeriodStartTimestamp;
        uint40 proposalPeriodDuration;
        uint40 votePeriodDuration;
        uint16 winnerCount;
        Award[] awards;
    }

    /// @notice Thrown when the round has already been defined
    error ROUND_ALREADY_DEFINED();

    /// @notice Thrown when the round has not yet been defined
    error ROUND_NOT_DEFINED();

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

    /// @notice Thrown when an asset rescue is attempted, but there is no excess balance in the contract
    error NO_EXCESS_BALANCE();

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

    /// @notice Emitted when an asset is rescued by the round manager
    /// This protects against the edge case in which tokens are sent directly
    /// to this contract, rather than passed through the award router.
    /// @param recipient The asset recipient
    /// @param assetId The ID of the asset being rescued
    /// @param amount The amount of the asset being rescued
    event AssetRescued(address recipient, uint256 assetId, uint256 amount);

    /// @notice Emitted when the round configuration is defined
    /// @param proposalPeriodStartTimestamp The timestamp at which the proposal period starts
    /// @param proposalPeriodDuration The proposal period duration in seconds
    /// @param votePeriodDuration The vote period duration in seconds
    /// @param winnerCount The number of possible winners
    event RoundDefined(
        uint40 proposalPeriodStartTimestamp,
        uint40 proposalPeriodDuration,
        uint40 votePeriodDuration,
        uint16 winnerCount
    );

    /// @notice Emitted when the round registration is submitted to L2
    /// @param awards The awards offered to winners
    event RoundRegistered(Award[] awards);

    /// @notice Emitted when the round is finalized
    event RoundFinalized();

    /// @notice Emitted when a round is cancelled by the round manager
    event RoundCancelled();

    /// @notice The current state of the timed funding round
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

    /// @notice The merkle root that allows winners to claim their awards. `bytes32(0)` if not finalized.
    function winnerMerkleRoot() external view returns (bytes32);
}
