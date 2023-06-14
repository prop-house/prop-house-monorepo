// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { AssetRound } from './base/AssetRound.sol';
import { IPropHouse } from '../interfaces/IPropHouse.sol';
import { IInfiniteRound } from '../interfaces/IInfiniteRound.sol';
import { REGISTER_ROUND_SELECTOR, INFINITE_ROUND_TYPE, MAX_250_BIT_UNSIGNED } from '../Constants.sol';
import { ITokenMetadataRenderer } from '../interfaces/ITokenMetadataRenderer.sol';
import { AssetController } from '../lib/utils/AssetController.sol';
import { IStarknetCore } from '../interfaces/IStarknetCore.sol';
import { ReceiptIssuer } from '../lib/utils/ReceiptIssuer.sol';
import { Asset, PackedAsset } from '../lib/types/Common.sol';
import { AssetHelper } from '../lib/utils/AssetHelper.sol';
import { MerkleProof } from '../lib/utils/MerkleProof.sol';
import { TokenHolder } from '../lib/utils/TokenHolder.sol';
import { IMessenger } from '../interfaces/IMessenger.sol';
import { IERC165 } from '../interfaces/IERC165.sol';
import { Uint256 } from '../lib/utils/Uint256.sol';

contract InfiniteRound is IInfiniteRound, AssetRound {
    using { Uint256.mask250 } for bytes32;
    using { Uint256.toUint256 } for address;
    using { AssetHelper.pack } for Asset[];

    /// @notice The amount of time before an award provider can reclaim unclaimed awards
    uint256 public constant RECLAIM_UNCLAIMED_AWARD_AFTER = 8 weeks;

    /// @notice The minimum vote period duration
    uint256 public constant MIN_VOTE_PERIOD_DURATION = 1 days;

    /// @notice The current state of the infinite round
    RoundState public state;

    /// @notice The timestamp at which the round was finalized. `0` if not finalized.
    uint40 public roundFinalizedAt;

    /// @notice The timestamp at which the round starts.
    uint40 public startTimestamp;

    /// @notice The vote period duration in seconds. `0` if not registered.
    uint40 public votePeriodDuration;

    /// @notice The number of winners that have been reported to date.
    uint64 public currentWinnerCount;

    constructor(
        uint256 _classHash,
        address _propHouse,
        address _starknet,
        address _messenger,
        uint256 _roundFactory,
        uint256 _executionRelayer,
        address _renderer
    ) AssetRound(INFINITE_ROUND_TYPE, _classHash, _propHouse, _starknet, _messenger, _roundFactory, _executionRelayer, _renderer) {}

    /// @notice If the contract implements an interface
    /// @param interfaceId The interface id
    function supportsInterface(bytes4 interfaceId) public view override(AssetRound, IERC165) returns (bool) {
        return AssetRound.supportsInterface(interfaceId);
    }

    // /// @notice Checks if `proposalId` was submitted by `user` and is a winner in the round using a Merkle proof
    // /// @param user The Ethereum address of the user to check
    // /// @param proposalId The ID of the proposal submitted by the user
    // /// @param proof The Merkle proof verifying the user's inclusion at the specified position in the round's winner list
    // function isWinner(address user, uint256 proposalId, bytes32[] calldata proof) external view returns (bool) {
    //     return MerkleProof.verify(proof, winnerMerkleRoot, keccak256(abi.encode(user, proposalId))); // TODO: Allow additional data to be passed?
    // }

    /// @notice Initialize the round by optionally defining the
    /// rounds configuration and registering it on L2.
    /// @dev This function is only callable by the prop house contract
    function initialize(bytes calldata data) external payable onlyPropHouse {
        if (data.length != 0) {
            return _register(abi.decode(data, (RoundConfig)));
        }
        if (msg.value != 0) {
            revert EXCESS_ETH_PROVIDED();
        }
    }

    /// @notice Define the configuration and register the round on L2.
    /// @param config The round configuration
    /// @dev This function is only callable by the round manager
    function register(RoundConfig calldata config) external payable onlyRoundManager {
        _register(config);
    }

    /// @notice Cancel the infinite round
    /// @dev This function is only callable by the round manager
    function cancel() external onlyRoundManager {
        if (state != RoundState.AwaitingRegistration && state != RoundState.Registered) {
            revert CANCELLATION_NOT_AVAILABLE();
        }
        state = RoundState.Cancelled;

        // TODO: Cancel the round on L2 using a state proof

        emit RoundCancelled();
    }

    function updateWinners(uint64 newWinnerCount, uint256 merkleRootLow, uint256 merkleRootHigh) external {
        if (newWinnerCount <= currentWinnerCount) {
            revert WINNERS_ALREADY_PROCESSED();
        }

        uint256[] memory payload = new uint256[](3);
        payload[0] = newWinnerCount;
        payload[1] = merkleRootLow;
        payload[2] = merkleRootHigh;

        // This function will revert if the message does not exist
        starknet.consumeMessageFromL2(executionRelayer, payload);

        // Reconstruct the merkle root, store it, and update the winner count
        winnerMerkleRoot = bytes32((merkleRootHigh << 128) + merkleRootLow);
        currentWinnerCount = newWinnerCount;

        emit WinnersUpdated(newWinnerCount);
    }

    /// @notice Finalize a round by unlocking all remaining funds.
    /// @dev This function is only callable by the round manager
    function finalizeRound() external onlyRoundManager {
        if (state != RoundState.Registered) {
            revert FINALIZATION_NOT_AVAILABLE();
        }

        roundFinalizedAt = uint40(block.timestamp);
        state = RoundState.Finalized;

        emit RoundFinalized();
    }


    /// @notice Claim many round award assets to a custom recipient
    /// @param recipient The asset recipient
    /// @param proposalId The winning proposal ID
    /// @param assets The assets to claim
    /// @param proof The merkle proof used to verify the validity of the asset payout
    function claimManyTo(
        address recipient,
        uint256 proposalId,
        Asset[] calldata assets,
        bytes32[] calldata proof
    ) external {
        _claimManyTo(recipient, proposalId, assets, proof);
    }

    /// @notice Claim many round award assets to the caller
    /// @param proposalId The winning proposal ID
    /// @param assets The assets to claim
    /// @param proof The merkle proof used to verify the validity of the asset payout
    function claimMany(uint256 proposalId, Asset[] calldata assets, bytes32[] calldata proof) external {
        _claimManyTo(msg.sender, proposalId, assets, proof);
    }

    /// @notice Reclaim assets to a custom recipient
    /// @param recipient The asset recipient
    /// @param assets The assets to reclaim
    function reclaimTo(address recipient, Asset[] calldata assets) public {
        // prettier-ignore
        // Reclamation is only available when the round is awaiting registration or
        // cancelled OR the round has been finalized and is in the reclamation period
        if (state == RoundState.Registered || (state == RoundState.Finalized && block.timestamp - roundFinalizedAt < RECLAIM_UNCLAIMED_AWARD_AFTER)) {
            revert RECLAMATION_NOT_AVAILABLE();
        }
        _reclaimTo(recipient, assets);
    }

    /// @notice Reclaim assets to the caller
    /// @param assets The assets to reclaim
    function reclaim(Asset[] calldata assets) external {
        reclaimTo(msg.sender, assets);
    }

    // prettier-ignore
    /// @notice Generate the payload required to register the round on L2
    /// @param config The round configuration
    function getL2Payload(RoundConfig memory config) public view returns (uint256[] memory payload) {
        uint256 vsCount = config.votingStrategies.length;
        uint256 vsParamFlatCount = config.votingStrategyParamsFlat.length;
        uint256 psCount = config.proposingStrategies.length;
        uint256 psParamsFlatCount = config.proposingStrategyParamsFlat.length;

        uint256 strategyParamsCount = vsCount + vsParamFlatCount + psCount + psParamsFlatCount;

        payload = new uint256[](14 + strategyParamsCount);

        // `payload[0]` is reserved for the round address, which is
        // set in the messenger contract for security purposes.
        payload[1] = classHash;

        // L2 strategy params
        payload[2] = 11 + strategyParamsCount;
        payload[3] = 10 + strategyParamsCount;
        payload[4] = keccak256(abi.encode(config.awards.pack())).mask250();
        payload[5] = config.startTimestamp;
        payload[6] = config.votePeriodDuration;
        payload[7] = config.quorumFor;
        payload[8] = config.quorumAgainst;

        payload[9] = config.proposalThreshold;

        uint256 offset = 10;
        (payload, offset) = _addStrategies(payload, offset, config.proposingStrategies, config.proposingStrategyParamsFlat);
        (payload, ) = _addStrategies(payload, ++offset, config.votingStrategies, config.votingStrategyParamsFlat);
        return payload;
    }

    /// @notice Define the configuration and register the round on L2.
    /// Duplicate voting strategies are handled on L2.
    /// @param config The round configuration
    function _register(RoundConfig memory config) internal {
        if (state != RoundState.AwaitingRegistration) {
            revert ROUND_ALREADY_REGISTERED();
        }
        _assertConfigValid(config);

        // Write round metadata to storage. This will be consumed by the token URI later.
        startTimestamp = _min(config.startTimestamp, uint40(block.timestamp));
        votePeriodDuration = config.votePeriodDuration;

        state = RoundState.Registered;

        // Register the round on L2
        messenger.sendMessageToL2{ value: msg.value }(roundFactory, REGISTER_ROUND_SELECTOR, getL2Payload(config));

        emit RoundRegistered(
            config.awards,
            config.proposalThreshold,
            config.proposingStrategies,
            config.proposingStrategyParamsFlat,
            config.votingStrategies,
            config.votingStrategyParamsFlat,
            config.startTimestamp,
            config.votePeriodDuration,
            config.quorumFor,
            config.quorumAgainst
        );
    }

    /// @notice Revert if the round configuration is invalid
    /// @param config The round configuration
    function _assertConfigValid(RoundConfig memory config) internal view {
        if (config.votePeriodDuration < MIN_VOTE_PERIOD_DURATION) {
            revert VOTE_PERIOD_DURATION_TOO_SHORT();
        }
        if (config.quorumFor == 0) {
            revert NO_FOR_QUORUM_PROVIDED();
        }
        if (config.quorumAgainst == 0) {
            revert NO_AGAINST_QUORUM_PROVIDED();
        }
        if (config.proposalThreshold != 0 && config.proposingStrategies.length == 0) {
            revert NO_PROPOSING_STRATEGIES_PROVIDED();
        }
        if (config.votingStrategies.length == 0) {
            revert NO_VOTING_STRATEGIES_PROVIDED();
        }
    }

    /// Returns the smallest of two numbers.
    /// @param a The first number
    /// @param b The second number
    function _min(uint40 a, uint40 b) internal pure returns (uint40) {
        return a < b ? a : b;
    }
}
