// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { HouseBase } from '../HouseBase.sol';
import { IHouse } from '../interfaces/IHouse.sol';
import { IFundingHouse } from './interfaces/IFundingHouse.sol';
import { IStrategyManager } from '../interfaces/IStrategyManager.sol';
import { IStrategyValidator } from '../strategies/interfaces/IStrategyValidator.sol';
import { FundingHouseStorageV1 } from './storage/FundingHouseStorageV1.sol';
import { MerkleProof } from '../lib/utils/MerkleProof.sol';
import { IAssetData } from '../interfaces/IAssetData.sol';
import { Batchable } from '../lib/utils/Batchable.sol';
import { AssetData } from '../lib/utils/AssetData.sol';
import { Uint256 } from '../lib/utils/Uint256.sol';
import { Vault } from '../lib/utils/Vault.sol';
import { ETH_ADDRESS } from '../Constants.sol';

contract FundingHouse is IFundingHouse, HouseBase, Batchable, Vault, FundingHouseStorageV1 {
    using { Uint256.split } for uint256;
    using { Uint256.mask250 } for bytes32;
    using { Uint256.toUint256 } for address;

    // prettier-ignore
    /// @notice The L2 selector used to register voting strategies
    uint256 constant REGISTER_VOTING_STRATEGY_SELECTOR = 0x8a9207beb9733d5e7212568d21aae1d276a3c89cb2f7f84acbd99f90410b73;

    /// @notice The amount of time before an award provider can reclaim unclaimed awards
    uint256 public constant AWARD_RECLAMATION_AFTER = 8 weeks;

    /// @notice The house name
    string public constant name = 'FUNDING_HOUSE';

    /// @notice The generalized execution relayer contract on Starknet
    uint256 public immutable executionRelayer;

    /// @notice The voting strategy registry contract on Starknet
    uint256 public immutable votingStrategyRegistry;

    constructor(
        uint256 executionRelayer_,
        uint256 votingStrategyRegistry_,
        address upgradeManager_,
        address strategyManager_,
        address starknetMessenger_,
        uint256 strategyFactory_,
        address weth_
    ) HouseBase(name, 1, upgradeManager_, strategyManager_, starknetMessenger_, strategyFactory_) Vault(weth_) {
        executionRelayer = executionRelayer_;
        votingStrategyRegistry = votingStrategyRegistry_;
    }

    /// @notice Initialize the funding house implementation
    /// @param creator The creator of the prop house
    /// @param data Initialization data
    function initialize(address creator, bytes calldata data) external payable initializer {
        super._initialize(creator);

        // prettier-ignore
        (string memory houseURI, address[] memory houseStrategies, address[] memory initiators, VotingStrategy[] memory votingStrategies) = abi.decode(data, (
            string,
            address[],
            address[],
            VotingStrategy[]
        ));
        _updateHouseURI(houseURI);
        _enableManyStrategies(houseStrategies);
        _addManyRoundInitiatorsToWhitelist(initiators);
        _addManyVotingStrategiesToWhitelist(votingStrategies);

        if (msg.value != 0) {
            _depositETH(creator);
        }
    }

    /// @notice Add a voting strategy to the whitelist
    /// @param strategy The L2 voting strategy information
    /// @dev This function is only callable by the house owner
    function addVotingStrategyToWhitelist(VotingStrategy calldata strategy) external onlyOwner returns (uint256) {
        return _addVotingStrategyToWhitelist(strategy);
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
    function initiateRound(RoundParams calldata round) external {
        address _initiator = msg.sender;

        _requireRoundInitiatorWhitelisted(_initiator);
        _requireStrategyEnabled(round.strategy.validator);
        _requireVotingStrategiesWhitelisted(round.votingStrategies);

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
        RoundParams calldata round,
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
        RoundParams calldata round,
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

        emit RoundInitiationCancellationCompleted(roundId);
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

        uint256[] memory payload = new uint256[](4);
        payload[0] = uint256(ExecutionType.Cancellation);
        payload[1] = roundId;
        payload[2] = awardHashLow;
        payload[3] = awardHashHigh;

        _messenger.starknet().consumeMessageFromL2(executionRelayer, payload);

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
        uint256[] memory payload = new uint256[](4);
        payload[0] = uint256(ExecutionType.MerkleProof);
        payload[1] = roundId;
        payload[2] = merkleRootLow;
        payload[3] = merkleRootHigh;

        // This function will revert if the message does not exist
        _messenger.starknet().consumeMessageFromL2(executionRelayer, payload);

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
        if (isAwardClaimed[roundId][proposalId]) {
            revert AwardAlreadyClaimed();
        }
        (, , bytes32 assetId) = AssetData.decodeAssetData(assetData);

        _computeLeafAndVerify(roundId, proposalId, winner, amount, assetId, proof);
        isAwardClaimed[roundId][proposalId] = true;

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
        if (isAwardClaimed[roundId][proposalId]) {
            revert AwardAlreadyClaimed();
        }
        (, , bytes32 assetId) = AssetData.decodeAssetData(assetData);

        _computeLeafAndVerify(roundId, proposalId, winner, amount, assetId, proof);
        isAwardClaimed[roundId][proposalId] = true;

        _withdrawTo(assetData, amount, recipient);
        emit AwardClaimed(roundId, proposalId, winner, assetId, amount, recipient);
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
        bytes32 leaf = keccak256(abi.encode(proposalId, winner, assetId, amount));
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
        RoundParams memory round,
        bytes32 awardHash
    ) internal returns (uint256[] memory payload) {
        IStrategyValidator validator = IStrategyValidator(round.strategy.validator);
        uint256[] memory params = validator.getStrategyParams(
            abi.encode(msg.sender, roundId, awardHash, round.strategy.config, round.awards)
        );
        uint256 numVotingStrategies = round.votingStrategies.length;
        if (numVotingStrategies == 0) {
            revert NoVotingStrategiesProvided();
        }

        uint256 offset = params.length;
        payload = new uint256[](offset + 1 + numVotingStrategies);
        unchecked {
            // Strategy Params
            for (uint256 i = 0; i < offset; ++i) {
                payload[i] = params[i];
            }

            // Voting Strategies
            payload[offset++] = numVotingStrategies;
            for (uint256 i = 0; i < numVotingStrategies; ++i) {
                payload[offset++] = round.votingStrategies[i];
            }
        }
        return payload;
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

    /// @notice Reverts if any of the provided voting strategies are not whitelisted
    /// For easy duplicate checking, provided strategy hashes MUST be ordered least to greatest
    /// @param strategyHashes The voting strategy hashes
    function _requireVotingStrategiesWhitelisted(uint256[] memory strategyHashes) internal view {
        unchecked {
            uint256 lastVotingStrategy = 0;
            uint256 numVotingStrategies = strategyHashes.length;
            for (uint256 i = 0; i < numVotingStrategies; ++i) {
                uint256 votingStrategy = strategyHashes[i];
                _requireVotingStrategyWhitelisted(votingStrategy);

                if (votingStrategy <= lastVotingStrategy) {
                    revert DuplicateVotingStrategy();
                }
                lastVotingStrategy = votingStrategy;
            }
        }
    }

    /// @notice Reverts if the voting strategy is not whitelisted
    /// @param strategyHash The voting strategy hash
    function _requireVotingStrategyWhitelisted(uint256 strategyHash) internal view {
        if (!isVotingStrategyWhitelisted[strategyHash]) {
            revert VotingStrategyNotWhitelisted();
        }
    }

    /// @notice Reverts if the round initiator is not whitelisted
    /// @param initiator The address of the round initiator
    function _requireRoundInitiatorWhitelisted(address initiator) internal view {
        if (!isRoundInitiatorWhitelisted[initiator]) {
            revert RoundInitiatorNotWhitelisted();
        }
    }

    /// @notice Add a round initiator to the whitelist
    /// @param initiator The initiator to add to the whitelist
    function _addRoundInitiatorToWhitelist(address initiator) internal {
        isRoundInitiatorWhitelisted[initiator] = true;
        emit RoundInitiatorAddedToWhitelist(initiator);
    }

    /// @notice Remove a round initiator from the whitelist
    /// @param initiator The initiator to remove from the whitelist
    function _removeRoundInitiatorFromWhitelist(address initiator) internal {
        isRoundInitiatorWhitelisted[initiator] = false;
        emit RoundInitiatorRemovedFromWhitelist(initiator);
    }

    /// @notice Add many round initiators to the whitelist
    /// @param initiators The initiators to add to the whitelist
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
    function _addVotingStrategyToWhitelist(VotingStrategy memory strategy) internal returns (uint256) {
        uint256 strategyHash = keccak256(abi.encode(strategy.addr, strategy.params)).mask250();
        _registerVotingStrategyOnL2(strategyHash, strategy);

        isVotingStrategyWhitelisted[strategyHash] = true;
        emit VotingStrategyAddedToWhitelist(strategyHash, strategy.addr, strategy.params);

        return strategyHash;
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
