// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { HouseBase } from '../HouseBase.sol';
import { IHouse } from '../interfaces/IHouse.sol';
import { IFundingHouse } from './interfaces/IFundingHouse.sol';
import { IStrategy } from '../strategies/interfaces/IStrategy.sol';
import { IStrategyManager } from '../interfaces/IStrategyManager.sol';
import { FundingHouseStorageV1 } from './storage/FundingHouseStorageV1.sol';
import { AssetDataUtils } from '../utils/AssetDataUtils.sol';
import { Uint256Utils } from '../utils/Uint256Utils.sol';
import { IAssetData } from '../interfaces/IAssetData.sol';
import { MerkleProof } from '../utils/MerkleProof.sol';
import { ETH_ADDRESS } from '../Constants.sol';
import { Vault } from '../utils/Vault.sol';

contract FundingHouse is IFundingHouse, HouseBase, Vault, FundingHouseStorageV1 {
    using { Uint256Utils.split } for uint256;
    using { Uint256Utils.mask250 } for bytes32;
    using { Uint256Utils.toUint256 } for address;

    // prettier-ignore
    /// @notice The L2 selector used to register voting strategies
    uint256 constant REGISTER_VOTING_STRATEGY_SELECTOR = 0x8a9207beb9733d5e7212568d21aae1d276a3c89cb2f7f84acbd99f90410b73;

    /// @notice The amount of time before an award provider can reclaim unclaimed awards
    uint256 public constant AWARD_RECLAMATION_AFTER = 8 weeks;

    /// @notice The house name
    string public constant name = 'FUNDING_HOUSE';

    /// @notice The merkle root relayer contract on Starknet
    uint256 public immutable merkleRootRelayer;

    /// @notice The cancellation hash relayer contract on Starknet
    uint256 public immutable cancellationHashRelayer;

    /// @notice The voting strategy registry contract on Starknet
    uint256 public immutable votingStrategyRegistry;

    constructor(
        uint256 merkleRootRelayer_,
        uint256 cancellationHashRelayer_,
        uint256 votingStrategyRegistry_,
        address upgradeManager_,
        address strategyManager_,
        address starknetMessenger_,
        uint256 strategyFactory_
    ) HouseBase(name, 1, upgradeManager_, strategyManager_, starknetMessenger_, strategyFactory_) {
        merkleRootRelayer = merkleRootRelayer_;
        cancellationHashRelayer = cancellationHashRelayer_;
        votingStrategyRegistry = votingStrategyRegistry_;
    }

    /// @notice Initialize the funding house implementation
    /// @param creator The creator of the prop house
    /// @param data Initialization data
    function initialize(address creator, bytes calldata data) external payable initializer {
        super._initialize(creator);

        (address[] memory initiators, VotingStrategy[] memory votingStrategies) = abi.decode(
            data,
            (address[], VotingStrategy[])
        );
        _addManyRoundInitiatorsToWhitelist(initiators);
        _addManyVotingStrategiesToWhitelist(votingStrategies);

        if (msg.value != 0) {
            _depositETH(creator);
        }
    }

    /// @notice Add a voting strategy to the whitelist
    /// @param strategy The L2 voting strategy information
    /// @dev This function is only callable by the house owner
    function addVotingStrategyToWhitelist(VotingStrategy calldata strategy) external onlyOwner {
        _addVotingStrategyToWhitelist(strategy);
    }

    /// @notice Remove a voting strategy from the whitelist
    /// @param strategyHash The masked strategy + param hash
    /// @dev This function is only callable by the house owner
    function removeVotingStrategyFromWhitelist(uint256 strategyHash) external onlyOwner {
        isVotingStrategyWhitelisted[strategyHash] = false;
        emit VotingStrategyRemovedFromWhitelist(strategyHash);
    }

    /// @notice Add a voting token to the whitelist
    /// @dev This function is only callable by the house owner
    function addRoundInitiatorToWhitelist(address initiator) external onlyOwner {
        _addRoundInitiatorToWhitelist(initiator);
    }

    /// @notice Add many round initiators to the whitelist
    /// @dev This function is only callable by the house owner
    function addManyRoundInitiatorsToWhitelist(address[] calldata initiators) external onlyOwner {
        _addManyRoundInitiatorsToWhitelist(initiators);
    }

    /// @notice Remove a voting token from the whitelist
    /// @dev This function is only callable by the house owner
    function removeRoundInitiatorFromWhitelist(address initiator) external onlyOwner {
        _removeRoundInitiatorFromWhitelist(initiator);
    }

    /// @notice Remove many round initiators from the whitelist
    /// @dev This function is only callable by the house owner
    function removeManyRoundInitiatorsFromWhitelist(address[] calldata initiators) external onlyOwner {
        unchecked {
            uint256 numInitiators = initiators.length;
            for (uint256 i = 0; i < numInitiators; ++i) {
                _removeRoundInitiatorFromWhitelist(initiators[i]);
            }
        }
    }

    /// @notice Initiate a funding round
    /// @param round The details required to initiate the funding round
    function initiateRound(RoundInitConfig calldata round) external {
        address _initiator = msg.sender;

        _requireStrategyEnabled(round.strategy);
        _requireRoundInitiatorWhitelisted(_initiator);

        // Debiting of award balances reverts on overflow
        _debitAwardsFromAccount(_initiator, round.awards);

        uint256 _roundId = ++roundId;
        bytes32 awardHash = keccak256(abi.encode(round.awards));

        Round storage _round = rounds[_roundId];
        _round.initiator = _initiator;
        _round.awardHash = awardHash;

        // prettier-ignore
        _messenger.sendMessageToL2(_strategyFactory, CREATE_STRATEGY_SELECTOR, _getL2Payload(_roundId, round, awardHash));

        emit RoundInitiated(
            _roundId,
            _initiator,
            round.title,
            round.description,
            round.tags,
            round.strategy,
            round.awards
        );
    }

    /// @notice Starts the cancellation of an round initiation message. This is useful when a strategy
    /// creation fails on Starknet.
    /// @param roundId The round ID
    /// @param round The details used to initiate the funding round
    /// @param nonce The message cancellation nonce
    function requestRoundInitiationCancellation(
        uint256 roundId,
        RoundInitConfig calldata round,
        uint256 nonce
    ) external {
        Round storage _round = rounds[roundId];
        if (_round.initiator != msg.sender) {
            revert OnlyRoundInitiatorCanCancel();
        }

        _messenger.startL1ToL2MessageCancellation(
            _strategyFactory,
            CREATE_STRATEGY_SELECTOR,
            _getL2Payload(roundId, round, _round.awardHash),
            nonce
        );
        emit RoundInitiationCancellationRequested(roundId);
    }

    /// @notice Completes the cancellation of an round initiation message. This function must be called
    /// `messageCancellationDelay` seconds after the call to `requestRoundInitiationCancellation`
    /// @param roundId The round ID
    /// @param round The details used to initiate the funding round
    /// @param nonce The message cancellation nonce
    function completeRoundInitiationCancellation(
        uint256 roundId,
        RoundInitConfig calldata round,
        uint256 nonce
    ) external {
        Round storage _round = rounds[roundId];
        if (_round.initiator != msg.sender) {
            revert OnlyRoundInitiatorCanCancel();
        }

        _messenger.cancelL1ToL2Message(
            _strategyFactory,
            CREATE_STRATEGY_SELECTOR,
            _getL2Payload(roundId, round, _round.awardHash),
            nonce
        );

        _creditAwardsToAccount(msg.sender, round.awards);
        _round.state = RoundState.Cancelled;

        emit RoundCancelled(roundId);
    }

    /// @notice Complete the cancellation of a round by consuming the message from Starknet,
    /// which includes the round ID and cancellation hash.
    /// @param roundId The ID of the round to cancel
    /// @param awards The round awards
    function completeRoundCancellation(uint256 roundId, Award[] calldata awards) external {
        Round storage round = rounds[roundId];
        if (round.state != RoundState.Active) {
            revert RoundNotActive();
        }

        (uint256 awardHashLow, uint256 awardHashHigh) = uint256(keccak256(abi.encode(awards))).split();

        uint256[] memory payload = new uint256[](3);
        payload[0] = roundId;
        payload[1] = awardHashLow;
        payload[2] = awardHashHigh;

        _messenger.starknet().consumeMessageFromL2(cancellationHashRelayer, payload);

        _creditAwardsToAccount(round.initiator, awards);
        round.state = RoundState.Cancelled;

        emit RoundCancelled(roundId);
    }

    /// @notice Finalize a round by consuming the round ID and merkle root from Starknet
    /// @param roundId The ID of the round to finalize
    /// @param merkleRootLow The lower half of the split merkle root
    /// @param merkleRootHigh The higher half of the split merkle root
    function finalizeRound(
        uint256 roundId,
        uint256 merkleRootLow,
        uint256 merkleRootHigh
    ) external {
        uint256[] memory payload = new uint256[](3);
        payload[0] = roundId;
        payload[1] = merkleRootLow;
        payload[2] = merkleRootHigh;

        // This function will revert if the message does not exist
        _messenger.starknet().consumeMessageFromL2(merkleRootRelayer, payload);

        // Reconstruct the execution hash, store it, and move the round to the finalized state
        Round storage round = rounds[roundId];
        round.merkleRoot = bytes32((merkleRootHigh << 128) + merkleRootLow);
        round.finalizedAt = uint40(block.timestamp);
        round.state = RoundState.Finalized;

        emit RoundFinalized(roundId);
    }

    /// @notice Reclaim an unclaimed award to a custom recipient
    /// @param roundId The round in which the award was won
    /// @param proposalId The winning proposal ID
    /// @param recipient The award recipient
    /// @param amount The award amount
    /// @param assetData THe data describing the award asset
    /// @param proof The merkle proof used to verify the validity of the award payout
    /// @dev This function is only callable by the round initiator
    function reclaimAwardToRecipient(
        uint256 roundId,
        uint256 proposalId,
        address winner,
        address recipient,
        bytes calldata assetData,
        uint256 amount,
        bytes32[] calldata proof
    ) external {
        Round memory round = rounds[roundId];
        if (round.state != RoundState.Finalized) {
            revert RoundNotFinalized();
        }
        if (block.timestamp - round.finalizedAt < AWARD_RECLAMATION_AFTER) {
            revert ReclamationNotAvailable();
        }
        if (round.initiator != msg.sender) {
            revert OnlyRoundInitiatorCanReclaim();
        }
        if (isAwardClaimed[roundId][winner]) {
            revert AwardAlreadyClaimed();
        }
        (, , bytes32 assetId) = AssetDataUtils.decodeAssetData(assetData);

        _computeLeafAndVerify(roundId, proposalId, winner, amount, assetId, proof);
        isAwardClaimed[roundId][winner] = true;

        _withdrawTo(assetData, amount, recipient);
        emit AwardReclaimed(roundId, proposalId, winner, assetId, amount, recipient);
    }

    /// @notice Claim a round award to a custom recipient
    /// @param roundId The round in which the award was won
    /// @param proposalId The winning proposal ID
    /// @param recipient The award recipient
    /// @param amount The award amount
    /// @param assetData THe data describing the award asset
    /// @param proof The merkle proof used to verify the validity of the award payout
    function claimAwardToRecipient(
        uint256 roundId,
        uint256 proposalId,
        address recipient,
        uint256 amount,
        bytes calldata assetData,
        bytes32[] calldata proof
    ) public {
        address winner = msg.sender;
        if (isAwardClaimed[roundId][winner]) {
            revert AwardAlreadyClaimed();
        }
        (, , bytes32 assetId) = AssetDataUtils.decodeAssetData(assetData);

        _computeLeafAndVerify(roundId, proposalId, winner, amount, assetId, proof);
        isAwardClaimed[roundId][winner] = true;

        _withdrawTo(assetData, amount, recipient);
        emit AwardPaid(roundId, proposalId, winner, assetId, amount, recipient);
    }

    /// @notice Claim a round award to the caller's address
    /// @param roundId The round in which the award was won
    /// @param proposalId The winning proposal ID
    /// @param amount The award amount
    /// @param assetData THe data describing the award asset
    /// @param proof The merkle proof used to verify the validity of the award payout
    function claimAward(
        uint256 roundId,
        uint256 proposalId,
        uint256 amount,
        bytes calldata assetData,
        bytes32[] calldata proof
    ) external {
        claimAwardToRecipient(roundId, proposalId, msg.sender, amount, assetData, proof);
    }

    /// @notice Given round winner information, compute a leaf node and verify the merkle proof
    /// @param roundId The round in which the award was won
    /// @param proposalId The winning proposal ID
    /// @param winner The winner address
    /// @param amount The award amount
    /// @param assetId The asset ID
    /// @param proof The merkle proof used to verify the validity of the award payout
    function _computeLeafAndVerify(
        uint256 roundId,
        uint256 proposalId,
        address winner,
        uint256 amount,
        bytes32 assetId,
        bytes32[] calldata proof
    ) internal view {
        bytes32 leaf = keccak256(abi.encodePacked(proposalId, winner, assetId, amount));
        if (!MerkleProof.verify(proof, rounds[roundId].merkleRoot, leaf)) {
            revert InvalidMerkleProof();
        }
    }

    /// @notice Get the payload used to initiate the round on L2
    /// @param roundId The round ID
    /// @param round The details required to initiate the funding round
    /// @param awardHash A hash of the locked asset ids and amounts
    function _getL2Payload(
        uint256 roundId,
        RoundInitConfig memory round,
        bytes32 awardHash
    ) internal returns (uint256[] memory payload) {
        uint256[] memory executionStrategies = new uint256[](1);
        executionStrategies[0] = merkleRootRelayer;

        bytes memory config = abi.encode(
            msg.sender,
            roundId,
            awardHash,
            round.config,
            round.awards,
            round.votingStrategies,
            executionStrategies
        );
        return IStrategy(round.strategy).getL2Payload(config);
    }

    /// @notice Debit the award asset amounts from the provided account
    /// @param account The account to debit
    /// @param awards The award assets and amounts to debit
    function _debitAwardsFromAccount(address account, Award[] memory awards) internal {
        uint256 numAwards = awards.length;
        for (uint256 i = 0; i < numAwards; ) {
            _debitInternalBalance(account, awards[i].assetId, awards[i].amount);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Credit the award asset amounts to the provided account
    /// @param account The account to credit
    /// @param awards The award assets and amounts to credit
    function _creditAwardsToAccount(address account, Award[] memory awards) internal {
        uint256 numAwards = awards.length;
        for (uint256 i = 0; i < numAwards; ) {
            _creditInternalBalance(account, awards[i].assetId, awards[i].amount);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Reverts if the round initiator is not whitelisted
    /// @param initiator The address of the round initiator
    function _requireRoundInitiatorWhitelisted(address initiator) internal view {
        if (!isRoundInitiatorWhitelisted[initiator]) {
            revert RoundInitiatorNotWhitelisted();
        }
    }

    /// @notice Add a voting token to the whitelist
    /// @param initiator The initiator to add to the whitelist
    function _addRoundInitiatorToWhitelist(address initiator) internal {
        isRoundInitiatorWhitelisted[initiator] = true;
        emit RoundInitiatorAddedToWhitelist(initiator);
    }

    /// @notice Remove a voting token from the whitelist
    /// @param initiator The initiator to remove from the whitelist
    function _removeRoundInitiatorFromWhitelist(address initiator) internal {
        isRoundInitiatorWhitelisted[initiator] = false;
        emit RoundInitiatorRemovedFromWhitelist(initiator);
    }

    /// @notice Add many round initiators to the whitelist
    function _addManyRoundInitiatorsToWhitelist(address[] memory initiators) internal {
        unchecked {
            uint256 numInitiators = initiators.length;
            for (uint256 i = 0; i < numInitiators; ++i) {
                _addRoundInitiatorToWhitelist(initiators[i]);
            }
        }
    }

    /// @notice Register an added voting strategy using a L1 -> L2 message
    /// @param strategyHash The masked hash of the L2 strategy + params
    /// @param strategy The L2 voting strategy information
    function _registerVotingStrategyOnL2(uint256 strategyHash, VotingStrategy memory strategy) internal {
        uint256 offset = 3;
        uint256 numParams = strategy.params.length;

        uint256[] memory payload = new uint256[](offset + numParams);
        payload[0] = strategyHash;
        payload[1] = strategy.addr;
        payload[2] = numParams;
        unchecked {
            for (uint256 i = 0; i < numParams; ++i) {
                payload[offset++] = strategy.params[i];
            }
        }
        _messenger.sendMessageToL2(votingStrategyRegistry, REGISTER_VOTING_STRATEGY_SELECTOR, payload);
    }

    /// @notice Add a voting strategy to the whitelist
    /// @param strategy The L2 voting strategy information
    function _addVotingStrategyToWhitelist(VotingStrategy memory strategy) internal {
        uint256 strategyHash = keccak256(abi.encode(strategy.addr, strategy.params)).mask250();
        _registerVotingStrategyOnL2(strategyHash, strategy);

        isVotingStrategyWhitelisted[strategyHash] = true;
        emit VotingStrategyAddedToWhitelist(strategyHash, strategy.addr, strategy.params);
    }

    /// @notice Add many voting strategies to the whitelist
    /// @param strategies The voting strategies to whitelist
    function _addManyVotingStrategiesToWhitelist(VotingStrategy[] memory strategies) internal {
        unchecked {
            uint256 numStrategies = strategies.length;
            for (uint256 i = 0; i < numStrategies; ++i) {
                _addVotingStrategyToWhitelist(strategies[i]);
            }
        }
    }
}
