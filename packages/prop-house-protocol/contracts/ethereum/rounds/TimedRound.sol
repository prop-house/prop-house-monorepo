// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { AssetRound } from './base/AssetRound.sol';
import { Asset, PackedAsset } from '../lib/types/Common.sol';
import { ITimedRound } from '../interfaces/ITimedRound.sol';
import { AssetHelper } from '../lib/utils/AssetHelper.sol';
import { MerkleProof } from '../lib/utils/MerkleProof.sol';
import { Selector, RoundType } from '../Constants.sol';
import { Uint256 } from '../lib/utils/Uint256.sol';

contract TimedRound is ITimedRound, AssetRound {
    using { Uint256.mask250 } for bytes32;
    using { AssetHelper.pack } for Asset;
    using { AssetHelper.packMany } for Asset[];

    /// @notice The amount of time before an asset provider can reclaim unclaimed assets
    uint256 public constant RECLAIM_UNCLAIMED_ASSETS_AFTER = 4 weeks;

    /// @notice Maximum winner count for this strategy
    uint256 public constant MAX_WINNER_COUNT = 25;

    /// @notice The minimum proposal submission period duration
    uint256 public constant MIN_PROPOSAL_PERIOD_DURATION = 1 days;

    /// @notice The minimum vote period duration
    uint256 public constant MIN_VOTE_PERIOD_DURATION = 1 days;

    /// @notice The current state of the timed round. `Active` upon deployment.
    RoundState public state;

    /// @notice The timestamp at which the round was finalized. `0` if not finalized.
    uint40 public finalizedAt;

    /// @notice The timestamp at which the proposal period starts. `0` if not registered.
    uint40 public proposalPeriodStartTimestamp;

    /// @notice The proposal period duration in seconds. `0` if not registered.
    uint40 public proposalPeriodDuration;

    /// @notice The vote period duration in seconds. `0` if not registered.
    uint40 public votePeriodDuration;

    /// @notice The number of possible winners. `0` if not registered.
    uint16 public winnerCount;

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
            RoundType.TIMED,
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

    /// @notice Checks if the `user` is a winner in the round when no assets were offered
    /// @param user The Ethereum address of the user
    /// @param proposalId The winning proposal ID
    /// @param position The rank or order of a winner in the round
    /// @param proof The Merkle proof verifying the user's inclusion at the specified position in the round's winner list
    function isWinner(
        address user,
        uint256 proposalId,
        uint256 position,
        bytes32[] calldata proof
    ) external view returns (bool) {
        return MerkleProof.verify(proof, winnerMerkleRoot, keccak256(abi.encode(user, proposalId, position)));
    }

    /// @notice Checks if the `user` is a winner in the round when assets were offered
    /// @param user The Ethereum address of the user
    /// @param proposalId The winning proposal ID
    /// @param position The rank or order of a winner in the round
    /// @param asset The asset that was won by the user
    /// @param proof The Merkle proof verifying the user's inclusion in the round's winner list
    function isAssetWinner(
        address user,
        uint256 proposalId,
        uint256 position,
        Asset calldata asset,
        bytes32[] calldata proof
    ) public view returns (bool) {
        return MerkleProof.verify(
            proof,
            winnerMerkleRoot,
            _computeClaimLeaf(proposalId, position, user, asset.pack())
        );
    }

    /// @notice Cancel the timed round
    /// @dev This function is only callable by the round manager
    function cancel() external payable onlyRoundManager {
        if (state != RoundState.Active) {
            revert CANCELLATION_NOT_AVAILABLE();
        }
        state = RoundState.Cancelled;

        // Notify Starknet of the cancellation
        _notifyRoundCancelled();

        emit RoundCancelled();
    }

    /// @notice Finalize the round by consuming the merkle root from Starknet.
    /// @param merkleRootLow The lower half of the split merkle root
    /// @param merkleRootHigh The higher half of the split merkle root
    function finalize(uint256 merkleRootLow, uint256 merkleRootHigh) external {
        if (state != RoundState.Active) {
            revert FINALIZATION_NOT_AVAILABLE();
        }

        uint256[] memory payload = new uint256[](2);
        payload[0] = merkleRootLow;
        payload[1] = merkleRootHigh;

        // This function will revert if the message does not exist
        starknet.consumeMessageFromL2(executionRelayer, payload);

        // Reconstruct the merkle root, store it, and move the round to the finalized state
        winnerMerkleRoot = bytes32((merkleRootHigh << 128) + merkleRootLow);
        finalizedAt = uint40(block.timestamp);
        state = RoundState.Finalized;

        emit RoundFinalized();
    }

    /// @notice Claim a round award asset to a custom recipient
    /// @param recipient The asset recipient
    /// @param proposalId The winning proposal ID
    /// @param position The rank or order of the winner in the round
    /// @param asset The asset to claim
    /// @param proof The merkle proof used to verify the validity of the asset payout
    function claimTo(
        address recipient,
        uint256 proposalId,
        uint256 position,
        Asset calldata asset,
        bytes32[] calldata proof
    ) external {
        _claimTo(recipient, proposalId, position, asset, proof);
    }

    /// @notice Claim a round award asset to the caller
    /// @param proposalId The winning proposal ID
    /// @param position The rank or order of the winner in the round
    /// @param asset The asset to claim
    /// @param proof The merkle proof used to verify the validity of the asset payout
    function claim(uint256 proposalId, uint256 position, Asset calldata asset, bytes32[] calldata proof) external {
        _claimTo(msg.sender, proposalId, position, asset, proof);
    }

    /// @notice Reclaim assets to a custom recipient
    /// @param recipient The asset recipient
    /// @param assets The assets to reclaim
    function reclaimTo(address recipient, Asset[] calldata assets) public {
        // prettier-ignore
        // Reclamation is only available when the round has been cancelled OR
        // the round has been finalized and is in the reclamation period
        if (state == RoundState.Active || (state == RoundState.Finalized && block.timestamp - finalizedAt < RECLAIM_UNCLAIMED_ASSETS_AFTER)) {
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

        payload = new uint256[](14 + strategyParamsCount);

        // `payload[0]` is reserved for the round address, which is
        // set in the messenger contract for security purposes.
        payload[1] = classHash;

        // L2 strategy params
        payload[2] = 11 + strategyParamsCount;
        payload[3] = 10 + strategyParamsCount;
        payload[4] = _computeAwardHash(config.awards);
        payload[5] = config.proposalPeriodStartTimestamp;
        payload[6] = config.proposalPeriodDuration;
        payload[7] = config.votePeriodDuration;
        payload[8] = config.winnerCount;

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
        _validate(config);

        // Write round metadata to storage. This will be consumed by the token URI later.
        proposalPeriodStartTimestamp = config.proposalPeriodStartTimestamp;
        proposalPeriodDuration = config.proposalPeriodDuration;
        votePeriodDuration = config.votePeriodDuration;
        winnerCount = config.winnerCount;

        // Register the round on L2
        messenger.sendMessageToL2{ value: msg.value }(roundFactory, Selector.REGISTER_ROUND, getRegistrationPayload(config));

        emit RoundRegistered(
            config.awards,
            config.proposalThreshold,
            config.proposingStrategies,
            config.proposingStrategyParamsFlat,
            config.votingStrategies,
            config.votingStrategyParamsFlat,
            config.proposalPeriodStartTimestamp,
            config.proposalPeriodDuration,
            config.votePeriodDuration,
            config.winnerCount
        );
    }

    // prettier-ignore
    /// @notice Revert if the round configuration is invalid
    /// @param config The round configuration
    function _validate(RoundConfig memory config) internal view {
        if (config.proposalPeriodStartTimestamp + config.proposalPeriodDuration < block.timestamp + MIN_PROPOSAL_PERIOD_DURATION) {
            revert REMAINING_PROPOSAL_PERIOD_DURATION_TOO_SHORT();
        }
        if (config.votePeriodDuration < MIN_VOTE_PERIOD_DURATION) {
            revert VOTE_PERIOD_DURATION_TOO_SHORT();
        }
        if (config.winnerCount == 0 || config.winnerCount > MAX_WINNER_COUNT) {
            revert WINNER_COUNT_OUT_OF_RANGE();
        }
        if (config.proposalThreshold != 0 && config.proposingStrategies.length == 0) {
            revert NO_PROPOSING_STRATEGIES_PROVIDED();
        }
        if (config.votingStrategies.length == 0) {
            revert NO_VOTING_STRATEGIES_PROVIDED();
        }
        if (config.awards.length != 0 && config.awards.length != config.winnerCount) {
            if (config.awards.length != 1) {
                revert AWARD_LENGTH_MISMATCH();
            }
            if (config.awards[0].amount % config.winnerCount != 0) {
                revert AWARD_AMOUNT_NOT_MULTIPLE_OF_WINNER_COUNT();
            }
        }
    }

    /// @notice Claim a round award asset to a custom recipient
    /// @param recipient The asset recipient
    /// @param proposalId The winning proposal ID
    /// @param position The position or rank of the proposal in the winners list
    /// @param asset The asset to claim
    /// @param proof The merkle proof used to verify the validity of the asset payout
    function _claimTo(
        address recipient,
        uint256 proposalId,
        uint256 position,
        Asset calldata asset,
        bytes32[] calldata proof
    ) internal {
        if (isClaimed(proposalId)) {
            revert ALREADY_CLAIMED();
        }
        PackedAsset memory packed = asset.pack();
        if (!MerkleProof.verify(proof, winnerMerkleRoot, _computeClaimLeaf(proposalId, position, msg.sender, packed))) {
            revert INVALID_MERKLE_PROOF();
        }
        _setClaimed(proposalId);
        _transfer(asset, address(this), payable(recipient));

        emit AssetClaimed(proposalId, msg.sender, recipient, packed);
    }

    /// @dev Computes a leaf in the winner merkle tree used to release assets to winners.
    /// @param proposalId The winning proposal ID
    /// @param position The position or rank of the proposal in the winners list
    /// @param user The user claiming the assets
    /// @param packed The packed asset that's being claimed
    function _computeClaimLeaf(uint256 proposalId, uint256 position, address user, PackedAsset memory packed) internal pure returns (bytes32) {
        return keccak256(abi.encode(proposalId, position, user, packed));
    }

    /// @notice Compute the award hash for the round, returning `0` if
    /// there are no awards.
    /// @param awards The round awards
    function _computeAwardHash(Asset[] memory awards) internal pure returns (uint256) {
        if (awards.length == 0) {
            return 0;
        }
        return keccak256(abi.encode(awards.packMany())).mask250();
    }
}
