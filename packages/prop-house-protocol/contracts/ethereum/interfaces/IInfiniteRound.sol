// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IRound } from './IRound.sol';
import { Asset } from '../lib/types/Common.sol';

// TODO: Should we force push deposits to L2? i.e. that's where we store balances?
// TODO: Allow quorum to be updated

/// @notice Interface implemented by the infinite round
interface IInfiniteRound is IRound {
    /// @notice All possible round states
    enum RoundState {
        AwaitingRegistration,
        Registered,
        Finalized,
        Cancelled
    }

    /// @notice The infinite round configuration
    struct RoundConfig {
        Asset[] awards;
        uint248 proposalThreshold;

        // TODO: Should these be 248?
        uint256[] proposingStrategies;
        uint256[] proposingStrategyParamsFlat;
        uint256[] votingStrategies;
        uint256[] votingStrategyParamsFlat;
        uint40 votePeriodDuration;
        uint40 startTimestamp;
        uint248 quorumAgainst;
        uint248 quorumFor;
    }

    /// @notice Thrown when the provided winners have already been processed.
    error WINNERS_ALREADY_PROCESSED();

    /// @notice Thrown when cancellation is attempted and the round is not active
    error CANCELLATION_NOT_AVAILABLE();

    /// @notice Thrown when finalization is attempted and the round is not active
    error FINALIZATION_NOT_AVAILABLE();

    /// @notice Thrown when award reclamation is not available
    error RECLAMATION_NOT_AVAILABLE();

    /// @notice Thrown when the vote period duration is too short
    error VOTE_PERIOD_DURATION_TOO_SHORT();

    /// @notice Thrown when no 'FOR' quorum is provided
    error NO_FOR_QUORUM_PROVIDED();

    /// @notice Thrown when no 'AGAINST' quorum is provided
    error NO_AGAINST_QUORUM_PROVIDED();

    /// @notice Thrown when the proposal threshold is non-zero and no proposing strategies are provided
    error NO_PROPOSING_STRATEGIES_PROVIDED();

    /// @notice Thrown when no voting strategies are provided
    error NO_VOTING_STRATEGIES_PROVIDED();

    /// @notice Thrown when attempting to register a round that has already been registered on L2
    error ROUND_ALREADY_REGISTERED();

    /// @notice Thrown when the operation would leave an excess ETH balance in the contract
    error EXCESS_ETH_PROVIDED();

    /// @notice Thrown when an asset rescue is attempted, but there is no excess balance in the contract
    error NO_EXCESS_BALANCE();

    /// @notice Emitted when an asset is rescued by the round manager
    /// This protects against the edge case in which tokens are sent directly
    /// to this contract, rather than passed through the prop house contract.
    /// @param rescuer The address of the rescuer
    /// @param recipient The asset recipient
    /// @param assetId The ID of the asset being rescued
    /// @param amount The amount of the asset being rescued
    event AssetRescued(address rescuer, address recipient, uint256 assetId, uint256 amount);

    /// @notice Emitted when the round is registered on L2
    /// @param awards The awards offered to round winners
    /// @param proposalThreshold The proposal threshold
    /// @param proposingStrategies The proposing strategy addresses
    /// @param proposingStrategyParamsFlat The flattened proposing strategy params
    /// @param votingStrategies The voting strategy addresses
    /// @param votingStrategyParamsFlat The flattened voting strategy params
    /// @param startTimestamp The timestamp at which the round starts
    /// @param votePeriodDuration The vote period duration in seconds
    /// @param quorumFor The number of votes required to approve a proposal
    /// @param quorumAgainst The number of votes required to reject a proposal
    event RoundRegistered(
        Asset[] awards,
        uint248 proposalThreshold,
        uint256[] proposingStrategies,
        uint256[] proposingStrategyParamsFlat,
        uint256[] votingStrategies,
        uint256[] votingStrategyParamsFlat,
        uint40 startTimestamp,
        uint40 votePeriodDuration,
        uint256 quorumFor,
        uint256 quorumAgainst
    );

    /// @notice Emitted when the addional winners are reported
    event WinnersUpdated(uint64 winnerCount);

    /// @notice Emitted when the round is finalized
    event RoundFinalized();

    /// @notice Emitted when a round is cancelled by the round manager
    event RoundCancelled();

    /// @notice The current state of the infinite round
    function state() external view returns (RoundState);

    /// @notice The timestamp at which the round was finalized. `0` if not finalized.
    function roundFinalizedAt() external view returns (uint40);

    /// @notice The timestamp at which the round starts.
    function startTimestamp() external view returns (uint40);

    /// @notice The vote period duration in seconds.
    function votePeriodDuration() external view returns (uint40);

    /// @notice Checks if the `user` has won for `proposalId` in the round
    /// @param user The Ethereum address of the user to check
    /// @param proposalId The proposal ID submitted by the user
    /// @param proof The Merkle proof verifying the user's inclusion at the specified position in the round's winner list
    function isWinner(address user, uint256 proposalId, bytes32[] calldata proof) external view returns (bool);
}
