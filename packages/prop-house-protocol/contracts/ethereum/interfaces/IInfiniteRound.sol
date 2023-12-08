// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { MetaTransaction } from '../lib/types/Common.sol';

/// @notice Interface implemented by the infinite round
interface IInfiniteRound {
    /// @notice All possible round states
    enum RoundState {
        Active,
        Cancelled,
        FinalizationPending,
        Finalized
    }

    /// @notice The infinite round configuration
    struct RoundConfig {
        MetaTransaction metaTx;
        uint248 proposalThreshold;
        uint256[] proposingStrategies;
        uint256[] proposingStrategyParamsFlat;
        uint256[] votingStrategies;
        uint256[] votingStrategyParamsFlat;
        uint40 startTimestamp;
        uint40 votePeriodDuration;
        uint248 quorumFor;
        uint248 quorumAgainst;
    }

    /// @notice Thrown when the provided winners have already been processed.
    error WINNERS_ALREADY_PROCESSED();

    /// @notice Thrown when cancellation is attempted and the round is not active
    error CANCELLATION_NOT_AVAILABLE();

    /// @notice Thrown when finalization is attempted and the round is not active
    error FINALIZATION_NOT_AVAILABLE();

    /// @notice Thrown when attempting to finalize with unprocessed winners
    error MUST_PROCESS_REMAINING_WINNERS();

    /// @notice Thrown when asset reclamation is not available
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

    /// @notice Thrown when the meta-transaction deposit amount is non-zero, but no relayer address is provided.
    error NO_META_TX_RELAYER_PROVIDED();

    /// @notice Thrown when an insufficient amount of ether is provided to `msg.value`
    error INSUFFICIENT_ETHER_SUPPLIED();

    /// @notice Emitted when the round is registered on L2
    /// @param metaTx The meta-transaction relayer and deposit amount
    /// @param proposalThreshold The proposal threshold
    /// @param proposingStrategies The proposing strategy addresses
    /// @param proposingStrategyParamsFlat The flattened proposing strategy params
    /// @param votingStrategies The voting strategy addresses
    /// @param votingStrategyParamsFlat The flattened voting strategy params
    /// @param votePeriodDuration The vote period duration in seconds
    /// @param startTimestamp The timestamp at which the round starts
    /// @param quorumFor The number of votes required to approve a proposal
    /// @param quorumAgainst The number of votes required to reject a proposal
    event RoundRegistered(
        MetaTransaction metaTx,
        uint248 proposalThreshold,
        uint256[] proposingStrategies,
        uint256[] proposingStrategyParamsFlat,
        uint256[] votingStrategies,
        uint256[] votingStrategyParamsFlat,
        uint40 startTimestamp,
        uint40 votePeriodDuration,
        uint248 quorumFor,
        uint248 quorumAgainst
    );

    /// @notice Emitted when the addional winners are reported
    event WinnersUpdated(uint64 winnerCount);

    /// @notice Emitted when round finalization is started
    event RoundFinalizationStarted();

    /// @notice Emitted when the round is finalized
    event RoundFinalized();

    /// @notice Emitted when a round is cancelled by the round manager
    event RoundCancelled();

    /// @notice Emitted when a round is cancelled by the security council in an emergency
    event RoundEmergencyCancelled();

    /// @notice The current state of the infinite round
    function state() external view returns (RoundState);

    /// @notice The timestamp at which the round was finalized. `0` if not finalized.
    function finalizedAt() external view returns (uint40);

    /// @notice The timestamp at which the round starts.
    function startTimestamp() external view returns (uint40);

    /// @notice The vote period duration in seconds.
    function votePeriodDuration() external view returns (uint40);
}
