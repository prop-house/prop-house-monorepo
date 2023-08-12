// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { AssetRound } from './base/AssetRound.sol';
import { AssetHelper } from '../lib/utils/AssetHelper.sol';
import { IInfiniteRound } from '../interfaces/IInfiniteRound.sol';
import { IncrementalMerkleProof } from '../lib/utils/IncrementalMerkleProof.sol';
import { Asset, PackedAsset, IncrementalTreeProof } from '../lib/types/Common.sol';
import { Selector, RoundType } from '../Constants.sol';
import { Uint256 } from '../lib/utils/Uint256.sol';

contract InfiniteRound is IInfiniteRound, AssetRound {
    using { Uint256.mask250 } for bytes32;
    using { AssetHelper.packMany } for Asset[];

    /// The maximum depth of the winner merkle tree
    uint256 public constant MAX_WINNER_TREE_DEPTH = 10;

    /// @notice The amount of time before an asset provider can reclaim unclaimed assets
    uint256 public constant RECLAIM_UNCLAIMED_ASSETS_AFTER = 1 weeks;

    /// @notice The minimum vote period duration
    uint256 public constant MIN_VOTE_PERIOD_DURATION = 1 days;

    /// @notice The current state of the infinite round. `Active` upon deployment.
    RoundState public state;

    /// @notice The timestamp at which the round was finalized. `0` if not finalized.
    uint40 public finalizedAt;

    /// @notice The timestamp at which the round starts.
    uint40 public startTimestamp;

    /// @notice The vote period duration in seconds. `0` if not registered.
    uint40 public votePeriodDuration;

    /// @notice The number of winners that have been reported to date.
    uint32 public currentWinnerCount;

    /// @notice The number of winners that have claimed their assets to date.
    uint32 public claimedWinnerCount;

    constructor(
        uint256 _classHash,
        address _propHouse,
        address _starknet,
        address _messenger,
        uint256 _roundFactory,
        uint256 _executionRelayer,
        address _renderer
    )
        AssetRound(
            RoundType.INFINITE,
            _classHash,
            _propHouse,
            _starknet,
            _messenger,
            _roundFactory,
            _executionRelayer,
            _renderer
        )
    {}

    /// @notice Initialize the round by defining the round's configuration
    /// and registering it on L2.
    /// @dev This function is only callable by the prop house contract
    function initialize(bytes calldata data) external payable onlyPropHouse {
        _register(abi.decode(data, (RoundConfig)));
    }

    /// @notice Checks if the `user` is a winner in the round
    /// @param user The Ethereum address of the user
    /// @param proposalId The winning proposal ID
    /// @param assets The assets that were requested by the user
    /// @param proof The Merkle proof verifying the user's inclusion in the round's winner list
    function isAssetWinner(
        address user,
        uint256 proposalId,
        Asset[] calldata assets,
        IncrementalTreeProof calldata proof
    ) public view returns (bool) {
        return IncrementalMerkleProof.verify(
            proof,
            MAX_WINNER_TREE_DEPTH,
            winnerMerkleRoot,
            _computeLeaf(proposalId, user, assets.packMany())
        );
    }

    /// @notice Update the winner count and merkle root, allowing new winners to claim their assets
    /// @param newWinnerCount The new winner count
    /// @param merkleRootLow The low 128 bits of the new merkle root
    /// @param merkleRootHigh The high 128 bits of the new merkle root
    function updateWinners(uint32 newWinnerCount, uint256 merkleRootLow, uint256 merkleRootHigh) external {
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

    /// @notice Cancel the infinite round
    /// @dev This function is only callable by the round manager
    /// and is only available when the round is active and no
    /// winners have been received.
    function cancel() external onlyRoundManager {
        if (state != RoundState.Active || currentWinnerCount != 0) {
            revert CANCELLATION_NOT_AVAILABLE();
        }
        state = RoundState.Cancelled;

        // Notify Starknet of the cancellation
        _notifyRoundCancelled();

        emit RoundCancelled();
    }

    /// @notice Start the round finalization process
    /// @dev This function is only callable by the round manager
    /// and is only available when the round is active and at least
    /// one winner has been received.
    function startFinalization() external payable onlyRoundManager {
        if (state != RoundState.Active || currentWinnerCount == 0) {
            revert FINALIZATION_NOT_AVAILABLE();
        }
        state = RoundState.FinalizationPending;

        // Finalize the round on Starknet
        _notifyFinalizeRound();

        emit RoundFinalizationStarted();
    }

    /// @notice Complete round finalization by consuming the final winner count
    /// from Starknet and validating that all winners have been processed.
    /// @param winnerCount The final number of winners in the round
    function completeFinalization(uint256 winnerCount) external {
        if (state != RoundState.FinalizationPending) {
            revert FINALIZATION_NOT_AVAILABLE();
        }
        if (winnerCount != currentWinnerCount) {
            revert MUST_PROCESS_REMAINING_WINNERS();
        }

        uint256[] memory payload = new uint256[](1);
        payload[0] = winnerCount;

        // This function will revert if the message does not exist
        starknet.consumeMessageFromL2(executionRelayer, payload);

        finalizedAt = uint40(block.timestamp);
        state = RoundState.Finalized;

        emit RoundFinalized();
    }

    /// @notice Claim one or more round award assets to a custom recipient
    /// @param recipient The asset recipient
    /// @param proposalId The winning proposal ID
    /// @param assets The assets to claim
    /// @param proof The merkle proof used to verify the validity of the asset payout
    function claimTo(address recipient, uint256 proposalId, Asset[] calldata assets, IncrementalTreeProof calldata proof) external {
        _claimManyTo(recipient, proposalId, assets, proof);
    }

    /// @notice Claim one or more round award assets to the caller
    /// @param proposalId The winning proposal ID
    /// @param assets The assets to claim
    /// @param proof The merkle proof used to verify the validity of the asset payout
    function claim(uint256 proposalId, Asset[] calldata assets, IncrementalTreeProof calldata proof) external {
        _claimManyTo(msg.sender, proposalId, assets, proof);
    }

    /// @notice Reclaim assets to a custom recipient
    /// @param recipient The asset recipient
    /// @param assets The assets to reclaim
    function reclaimTo(address recipient, Asset[] calldata assets) public {
        if (!_canReclaim()) {
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
    function getRegistrationPayload(RoundConfig memory config) public view returns (uint256[] memory payload) {
        uint256 vsCount = config.votingStrategies.length;
        uint256 vsParamFlatCount = config.votingStrategyParamsFlat.length;
        uint256 psCount = config.proposingStrategies.length;
        uint256 psParamsFlatCount = config.proposingStrategyParamsFlat.length;

        uint256 strategyParamsCount = vsCount + vsParamFlatCount + psCount + psParamsFlatCount;

        payload = new uint256[](13 + strategyParamsCount);

        // `payload[0]` is reserved for the round address, which is
        // set in the messenger contract for security purposes.
        payload[1] = classHash;

        // L2 strategy params
        payload[2] = 10 + strategyParamsCount;
        payload[3] = 9 + strategyParamsCount;
        payload[4] = config.startTimestamp;
        payload[5] = config.votePeriodDuration;
        payload[6] = config.quorumFor;
        payload[7] = config.quorumAgainst;

        payload[8] = config.proposalThreshold;

        uint256 offset = 9;
        (payload, offset) = _addStrategies(payload, offset, config.proposingStrategies, config.proposingStrategyParamsFlat);
        (payload, ) = _addStrategies(payload, ++offset, config.votingStrategies, config.votingStrategyParamsFlat);
        return payload;
    }

    /// @notice Define the configuration and register the round on L2.
    /// Duplicate voting strategies are handled on L2.
    /// @param config The round configuration
    function _register(RoundConfig memory config) internal {
        _validate(config);

        // Set the round start timestamp to the current block timestamp if it is in the past.
        config.startTimestamp = _max(config.startTimestamp, uint40(block.timestamp));

        // Write round metadata to storage. This will be consumed by the token URI later.
        startTimestamp = config.startTimestamp;
        votePeriodDuration = config.votePeriodDuration;

        // Register the round on L2
        messenger.sendMessageToL2{ value: msg.value }(roundFactory, Selector.REGISTER_ROUND, getRegistrationPayload(config));

        emit RoundRegistered(
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
    function _validate(RoundConfig memory config) internal pure {
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

    /// @notice Claim many round award assets to a custom recipient
    /// @param recipient The asset recipient
    /// @param proposalId The winning proposal ID
    /// @param assets The assets to claim
    /// @param proof The merkle proof used to verify the validity of the asset payout
    function _claimManyTo(
        address recipient,
        uint256 proposalId,
        Asset[] memory assets,
        IncrementalTreeProof memory proof
    ) internal {
        if (isClaimed(proposalId)) {
            revert ALREADY_CLAIMED();
        }
        unchecked {
            ++claimedWinnerCount;
        }

        PackedAsset[] memory packed = assets.packMany();
        if (!IncrementalMerkleProof.verify(proof, MAX_WINNER_TREE_DEPTH, winnerMerkleRoot, _computeLeaf(proposalId, msg.sender, packed))) {
            revert INVALID_MERKLE_PROOF();
        }
        _setClaimed(proposalId);
        _transferMany(assets, address(this), payable(recipient));

        emit AssetsClaimed(proposalId, msg.sender, recipient, packed);
    }

    /// @dev Computes a leaf in the incremental merkle tree used to release assets to winners.
    /// @param proposalId The winning proposal ID
    /// @param user The user claiming the assets
    /// @param packed The packed assets being claimed
    function _computeLeaf(uint256 proposalId, address user, PackedAsset[] memory packed) internal pure returns (bytes32) {
        return keccak256(abi.encode(proposalId, user, keccak256(abi.encode(packed)).mask250()));
    }

    /// Returns true if reclamation is available
    function _canReclaim() internal view returns (bool) {
        // Reclamation is immediately available when the round has been cancelled
        if (state == RoundState.Cancelled) {
            return true;
        }
        // Reclamation is available when the round has been finalized and the reclamation period has passed
        // or when all winners have claimed
        if (state == RoundState.Finalized) {
            return block.timestamp - finalizedAt >= RECLAIM_UNCLAIMED_ASSETS_AFTER || claimedWinnerCount == currentWinnerCount;
        }
        return false;
    }

    /// @dev Route a round finalization call to the round contract on Starknet
    /// `payload[0]` - Round address
    /// `payload[2]` - Empty calldata array length
    function _notifyFinalizeRound() internal {
        uint256[] memory payload = new uint256[](3);
        payload[1] = Selector.FINALIZE_ROUND;

        _callStarknetRound(payload);
    }

    /// @dev Returns the largest of two numbers.
    /// @param a The first number
    /// @param b The second number
    function _max(uint40 a, uint40 b) internal pure returns (uint40) {
        return a > b ? a : b;
    }
}
