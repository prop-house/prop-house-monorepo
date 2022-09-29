// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IHouse } from '../../interfaces/IHouse.sol';
import { IVault } from '../../interfaces/IVault.sol';

/// @notice Interface for the Funding House
interface IFundingHouse is IHouse, IVault {
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

    /// @notice Round initiation configuration data
    struct RoundInitConfig {
        string title; // A short title for the round
        string description; // A desciption that adds context about the round
        string[] tags; // Tags used to improve searchability and filtering
        address strategy; // The strategy contract address
        bytes config; // The strategy contract configuration
        uint256[] votingStrategies; // The hashes of the selected voting strategies
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

    error RoundInitiatorNotWhitelisted();

    error RoundNotActive();

    error RoundNotFinalized();

    error ReclamationNotAvailable();

    error AwardAlreadyClaimed();

    error OnlyRoundInitiatorCanReclaim();

    error OnlyRoundInitiatorCanCancel();

    error InvalidMerkleProof();

    event RoundInitiatorAddedToWhitelist(address initiator);

    event RoundInitiatorRemovedFromWhitelist(address initiator);

    event VotingStrategyAddedToWhitelist(uint256 strategyHash, uint256 strategy, uint256[] params);

    event VotingStrategyRemovedFromWhitelist(uint256 strategyHash);

    event RoundInitiated(
        uint256 indexed roundId,
        address initiator,
        string title,
        string description,
        string[] tags,
        address strategy,
        Award[] awards
    );

    event RoundFinalized(uint256 indexed roundId);

    event RoundInitiationCancellationRequested(uint256 indexed roundId);

    event RoundInitiationCancellationCompleted(uint256 indexed roundId);

    event RoundCancelled(uint256 indexed roundId);

    event AwardPaid(
        uint256 indexed roundId,
        uint256 proposalId,
        address winner,
        bytes32 assetId,
        uint256 amount,
        address recipient
    );

    event AwardReclaimed(
        uint256 indexed roundId,
        uint256 proposalId,
        address winner,
        bytes32 assetId,
        uint256 amount,
        address recipient
    );
}
