// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { AssetRound } from './base/AssetRound.sol';
import { ITimedRound } from '../interfaces/ITimedRound.sol';
import { AssetHelper } from '../lib/utils/AssetHelper.sol';
import { Selector, RoundType } from '../Constants.sol';
import { Uint256 } from '../lib/utils/Uint256.sol';
import { Asset } from '../lib/types/Common.sol';

contract TimedRound is ITimedRound, AssetRound {
    using { Uint256.mask250 } for bytes32;
    using { AssetHelper.packMany } for Asset[];

    /// @notice The amount of time before an award provider can reclaim unclaimed awards
    uint256 public constant RECLAIM_UNCLAIMED_AWARD_AFTER = 8 weeks;

    /// @notice Maximum winner count for this strategy
    uint256 public constant MAX_WINNER_COUNT = 25;

    /// @notice The minimum proposal submission period duration
    uint256 public constant MIN_PROPOSAL_PERIOD_DURATION = 1 days;

    /// @notice The minimum vote period duration
    uint256 public constant MIN_VOTE_PERIOD_DURATION = 1 days;

    /// @notice The current state of the timed round
    RoundState public state;

    /// @notice The timestamp at which the round was finalized. `0` if not finalized.
    uint40 public roundFinalizedAt;

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
    ) AssetRound(RoundType.TIMED, _classHash, _propHouse, _starknet, _messenger, _roundFactory, _executionRelayer, _renderer) {}

    /// @notice Initialize the round by defining the round's configuration
    /// and registering it on L2.
    /// @dev This function is only callable by the prop house contract
    function initialize(bytes calldata data) external payable onlyPropHouse {
        _register(abi.decode(data, (RoundConfig)));
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
        roundFinalizedAt = uint40(block.timestamp);
        state = RoundState.Finalized;

        emit RoundFinalized();
    }

    /// @notice Claim a round award asset to a custom recipient
    /// @param recipient The asset recipient
    /// @param proposalId The winning proposal ID
    /// @param asset The asset to claim
    /// @param proof The merkle proof used to verify the validity of the asset payout
    function claimTo(
        address recipient,
        uint256 proposalId,
        Asset calldata asset,
        bytes32[] calldata proof
    ) external {
        _claimTo(recipient, proposalId, asset, proof);
    }

    /// @notice Claim a round award asset to the caller
    /// @param proposalId The winning proposal ID
    /// @param asset The asset to claim
    /// @param proof The merkle proof used to verify the validity of the asset payout
    function claim(uint256 proposalId, Asset calldata asset, bytes32[] calldata proof) external {
        _claimTo(msg.sender, proposalId, asset, proof);
    }

    /// @notice Reclaim assets to a custom recipient
    /// @param recipient The asset recipient
    /// @param assets The assets to reclaim
    function reclaimTo(address recipient, Asset[] calldata assets) public {
        // prettier-ignore
        // Reclamation is only available when the round has been cancelled OR
        // the round has been finalized and is in the reclamation period
        if (state == RoundState.Active || (state == RoundState.Finalized && block.timestamp - roundFinalizedAt < RECLAIM_UNCLAIMED_AWARD_AFTER)) {
            revert RECLAMATION_NOT_AVAILABLE();
        }
        _reclaimTo(recipient, assets);
    }

    /// @notice Reclaim assets to the caller
    /// @param assets The assets to reclaim
    function reclaim(Asset[] calldata assets) external {
        _reclaimTo(msg.sender, assets);
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
        payload[4] = keccak256(abi.encode(config.awards.packMany())).mask250();
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

        state = RoundState.Active;

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
        if (config.awards.length != 1 && config.awards.length != config.winnerCount) {
            revert AWARD_LENGTH_MISMATCH();
        }
        if (config.awards.length == 1 && config.winnerCount > 1 && config.awards[0].amount % config.winnerCount != 0) {
            revert AWARD_AMOUNT_NOT_MULTIPLE_OF_WINNER_COUNT();
        }
        if (config.proposalThreshold != 0 && config.proposingStrategies.length == 0) {
            revert NO_PROPOSING_STRATEGIES_PROVIDED();
        }
        if (config.votingStrategies.length == 0) {
            revert NO_VOTING_STRATEGIES_PROVIDED();
        }
    }
}
