// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IHouse } from '../../interfaces/IHouse.sol';
import { IVault } from '../../interfaces/IVault.sol';

/// @notice Interface for the Funding House
interface IFundingHouse is IHouse, IVault {
    /// @notice Supported funding house execution types
    enum ExecutionType {
        MerkleProof,
        Cancellation
    }

    /// @notice All possible L1 round states
    enum RoundState {
        Active,
        Finalized,
        Cancelled
    }

    /// @notice An award asset offered to one or more round winners
    struct Award {
        bytes32 assetId;
        uint256 amount;
    }

    /// @notice Voting strategy information used during house initialization
    struct VotingStrategy {
        uint256 addr;
        uint256[] params;
    }

    /// @notice House strategy validator and configuration information
    struct HouseStrategy {
        address validator;
        bytes config;
    }

    /// @notice Round initiation parameters
    struct RoundParams {
        string title; // A short title for the round
        string description; // A desciption that adds context about the round
        string[] tags; // Tags used to improve searchability and filtering
        uint256[] votingStrategies; // The hashes of the selected voting strategies
        HouseStrategy strategy; // The house strategy validator contract and configuration data
        Award[] awards; // The assets offered to round winners
    }

    /// @notice Round information that's persisted in storage
    struct Round {
        RoundState state; // The current state of the round
        uint40 finalizedAt; // The timestamp at which the round was finalized
        address initiator; // The address that initiated the round
        address funder; // The address that provided the award asset(s)
        bytes32 awardHash; // A hash of the locked asset ids and amounts
        bytes32 merkleRoot; // Merkle root used to claim awards
    }

    /// @notice Thrown when no voting strategies are provided
    error NoVotingStrategiesProvided();

    /// @notice Thrown when the same voting strategy is included multiple times in an array
    error DuplicateVotingStrategy();

    /// @notice Thrown when attempting to use an unregistered voting strategy
    error VotingStrategyNotWhitelisted();

    /// @notice Thrown when the address attempting to initiate a round is not whitelisted
    error RoundInitiatorNotWhitelisted();

    /// @notice Thrown when a funding round is not active
    error RoundNotActive();

    /// @notice Thrown when a funding round is not finalized
    error RoundNotFinalized();

    /// @notice Thrown when award reclamation is not available
    error ReclamationNotAvailable();

    /// @notice Thrown when an award has already been claimed
    error AwardAlreadyClaimed();

    /// @notice Thrown when the address attempting to reclaim an award is not the round initiator
    error OnlyRoundInitiatorCanReclaim();

    /// @notice Thrown when the address attempting to cancel a round is not the round initiator
    error OnlyRoundInitiatorCanCancel();

    /// @notice Thrown when the provided merkle proof is invalid
    error InvalidMerkleProof();

    /// @notice Emitted when a round initiator is added to the whitelist
    /// @param initiator The address of the round initiator
    event RoundInitiatorAddedToWhitelist(address initiator);

    /// @notice Emitted when a round initiator is removed from the whitelist
    /// @param initiator The address of the round initiator
    event RoundInitiatorRemovedFromWhitelist(address initiator);

    /// @notice Emitted when a voting strategy is added to the whitelist
    /// @param strategyHash The keccak256 hash of the added strategy address and params
    /// @param strategy The Starknet voting strategy contract address
    /// @param params The voting strategy parameters
    event VotingStrategyAddedToWhitelist(uint256 strategyHash, uint256 strategy, uint256[] params);

    /// @notice Emitted when a voting strategy is removed from the whitelist
    /// @param strategyHash The keccak256 hash of the removed strategy address and params
    event VotingStrategyRemovedFromWhitelist(uint256 strategyHash);

    /// @notice Emitted when a funding round is initiated
    /// @param roundId The ID of the funding round
    /// @param initiator The round initiator (caller)
    /// @param title The round title
    /// @param description The round description
    /// @param tags The round tag metadata
    /// @param strategy The house strategy used by the round
    /// @param awards The awards offered in the round
    event RoundInitiated(
        uint256 indexed roundId,
        address initiator,
        string title,
        string description,
        string[] tags,
        HouseStrategy strategy,
        Award[] awards
    );

    /// @notice Emitted when a funding round is finalized
    /// @param roundId The ID of the funding round
    event RoundFinalized(uint256 indexed roundId);

    /// @notice Emitted when a round initiation message cancellation is requested
    /// @param roundId The ID of the funding round
    event RoundInitiationCancellationRequested(uint256 indexed roundId);

    /// @notice Emitted when a round initiation message cancellation is completed
    /// @param roundId The ID of the funding round
    event RoundInitiationCancellationCompleted(uint256 indexed roundId);

    /// @notice Emitted when a round is cancelled by the round initiator
    /// @param roundId The ID of the funding round
    event RoundCancelled(uint256 indexed roundId);

    /// @notice Emitted when a funding round award is claimed
    /// @param roundId The ID of the funding round
    /// @param proposalId The ID of the winning proposal
    /// @param winner The address of the winner
    /// @param assetId The ID of the asset being claimed
    /// @param amount The amount of `asset` being claimed
    /// @param recipient The recipient of the award
    event AwardClaimed(
        uint256 indexed roundId,
        uint256 proposalId,
        address winner,
        bytes32 assetId,
        uint256 amount,
        address recipient
    );

    /// @notice Emitted when a funding round award is reclaimed by the initiator
    /// @param roundId The ID of the funding round
    /// @param proposalId The ID of the winning proposal
    /// @param winner The address of the winner
    /// @param assetId The ID of the asset being reclaimed
    /// @param amount The amount of `asset` being reclaimed
    /// @param recipient The asset recipient
    event AwardReclaimed(
        uint256 indexed roundId,
        uint256 proposalId,
        address winner,
        bytes32 assetId,
        uint256 amount,
        address recipient
    );
}
