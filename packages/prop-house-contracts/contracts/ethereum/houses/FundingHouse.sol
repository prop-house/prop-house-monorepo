// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { HouseBase } from '../HouseBase.sol';
import { IHouse } from '../interfaces/IHouse.sol';
import { IFundingHouse } from '../interfaces/houses/IFundingHouse.sol';
import { FundingHouseStorageV1 } from './storage/FundingHouseStorageV1.sol';
import { REGISTER_VOTING_STRATEGY_SELECTOR } from '../Constants.sol';
import { IHouseStrategy } from '../interfaces/IHouseStrategy.sol';
import { IAwardRouter } from '../interfaces/IAwardRouter.sol';
import { LibClone } from 'solady/src/utils/LibClone.sol';
import { Uint256 } from '../lib/utils/Uint256.sol';
import { ERC721 } from '../lib/token/ERC721.sol';
import { Asset } from '../lib/types/Common.sol';

// TODO: on after transfer hook:
// - Callback to house if it supports whatever interface? Is that how we hook?

contract FundingHouse is IFundingHouse, HouseBase, ERC721, FundingHouseStorageV1 {
    using LibClone for address;
    using { Uint256.mask250 } for bytes32;

    /// @notice The contract used to route ETH, ERC20, ERC721, & ERC1155 tokens
    IAwardRouter private immutable _awardRouter;

    /// @notice The voting strategy registry contract on Starknet
    uint256 private immutable _votingStrategyRegistry;

    constructor(
        address awardRouter_,
        uint256 votingStrategyRegistry_,
        address upgradeManager_,
        address strategyManager_,
        address messenger_
    ) HouseBase('FUNDING_HOUSE', 1, upgradeManager_, strategyManager_, messenger_) {
        _awardRouter = IAwardRouter(awardRouter_);
        _votingStrategyRegistry = votingStrategyRegistry_;
    }

    /// @notice Initialize the funding house implementation
    /// @param creator The creator of the prop house
    /// @param data Initialization data
    function initialize(address creator, bytes calldata data) external initializer {
        (
            string memory name,
            string memory symbol,
            string memory contractURI,
            address[] memory initialCreators,
            address[] memory initialHouseStrategies,
            VotingStrategy[] memory initialVotingStrategies
        ) = abi.decode(data, (string, string, string, address[], address[], VotingStrategy[]));

        __Ownable_init(creator);
        __ERC721_init(name, symbol);

        _updateContractURI(contractURI);
        _enableManyStrategies(initialHouseStrategies);
        _addManyRoundCreatorsToWhitelist(initialCreators);
        _addManyVotingStrategiesToWhitelist(initialVotingStrategies);
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
    function addRoundCreatorToWhitelist(address creator) external onlyOwner {
        _addRoundCreatorToWhitelist(creator);
    }

    /// @notice Add many round creators to the whitelist
    /// @dev This function is only callable by the house owner
    function addManyRoundCreatorsToWhitelist(address[] calldata creators) external onlyOwner {
        _addManyRoundCreatorsToWhitelist(creators);
    }

    /// @notice Remove a voting token from the whitelist
    /// @dev This function is only callable by the house owner
    function removeRoundCreatorFromWhitelist(address creator) external onlyOwner {
        _removeRoundCreatorFromWhitelist(creator);
    }

    /// @notice Remove many round creators from the whitelist
    /// @dev This function is only callable by the house owner
    function removeManyRoundCreatorsFromWhitelist(address[] calldata creators) external onlyOwner {
        unchecked {
            uint256 numCreators = creators.length;
            for (uint256 i = 0; i < numCreators; ++i) {
                _removeRoundCreatorFromWhitelist(creators[i]);
            }
        }
    }

    /// @notice Create a new funding round and mint the round manager NFT to the caller
    /// @param strategy The house strategy implementation contract address
    // /// @param config The house strategy configuration data
    /// @param voting The selected voting strategy IDs
    /// @param title A short title for the round
    /// @param description A desciption that adds context about the round
    /// @param tags Tags used to improve searchability and filtering
    function createRound(
        address strategy,
        // bytes calldata config,
        uint256[] calldata voting,
        string calldata title,
        string calldata description,
        string[] calldata tags
    ) external returns (address) {
        address round = _createRound(strategy, voting, title, description, tags);
        IHouseStrategy(round).initialize(new bytes(0));

        return round;
    }

    /// @notice Create a new funding round, partially or fully fund it, and mint the round manager NFT to the caller
    /// @param strategy The house strategy implementation contract address
    /// @param config The house strategy configuration data
    /// @param voting The selected voting strategy IDs
    /// @param title A short title for the round
    /// @param description A desciption that adds context about the round
    /// @param tags Tags used to improve searchability and filtering
    /// @param assets Assets to deposit to the funding round
    function createAndFundRound(
        address strategy,
        bytes calldata config,
        uint256[] calldata voting,
        string calldata title,
        string calldata description,
        string[] calldata tags,
        Asset[] calldata assets
    ) external payable returns (address) {
        address round = _createRound(strategy, voting, title, description, tags);

        _awardRouter.batchPullTo{ value: msg.value }(msg.sender, payable(round), assets);
        IHouseStrategy(round).initialize(config);

        return round;
    }

    /// @notice Forwards a cross-chain message from a house strategy to the Starknet messenger contract
    /// @param toAddress The callee address
    /// @param selector The function selector
    /// @param payload The message payload
    function forwardMessageToL2(
        uint256 toAddress,
        uint256 selector,
        uint256[] calldata payload
    ) external onlyHouseStrategy returns (bytes32) {
        return _messenger.sendMessageToL2(toAddress, selector, payload);
    }

    /// @notice Returns `true` if the provided address is a valid strategy for this house
    /// @param strategy The house strategy to validate
    function isValidHouseStrategy(address strategy) public view override(IHouse, HouseBase) returns (bool) {
        address expectedStrategy = getHouseStrategyAddress(_codeHash(strategy), IHouseStrategy(strategy).roundId());
        return strategy == expectedStrategy;
    }

    /// @notice Get the house strategy address for a given code hash and token ID
    /// @param codeHash The code hash
    /// @param tokenId The token ID
    function getHouseStrategyAddress(bytes32 codeHash, uint256 tokenId) public view returns (address) {
        return LibClone.predictDeterministicAddress(codeHash, _salt(tokenId), address(this));
    }

    /// @notice Create a new funding round and mint the round manager NFT to the caller
    /// @param strategy The house strategy implementation contract address
    // /// @param config The house strategy configuration data
    /// @param voting The selected voting strategy IDs
    /// @param title A short title for the round
    /// @param description A desciption that adds context about the round
    /// @param tags Tags used to improve searchability and filtering
    function _createRound(
        address strategy,
        // bytes memory config,
        uint256[] memory voting,
        string memory title,
        string memory description,
        string[] memory tags
    ) internal returns (address) {
        // Validate strategy, voting information, and creator
        _requireStrategyEnabled(strategy);
        _requireVotingStrategiesWhitelisted(voting);
        _requireRoundCreatorWhitelisted(msg.sender); // TODO: Use separate ERC1155 for this? Make optional?

        uint256 _roundId = ++roundId;

        // Mint the management token to the round creator
        _mint(msg.sender, _roundId);

        address round = strategy.cloneDeterministic(_encodeData(_roundId, voting), _salt(_roundId));

        emit RoundCreated(_roundId, voting, title, description, tags, strategy, round);
        return round;
    }

    /// @notice Returns the downcasted uint8 from uint256, reverting on
    /// overflow (when the input is greater than largest uint8).
    /// @param value The value to cast
    function _toUint8(uint256 value) internal pure returns (uint8) {
        if (value > type(uint8).max) {
            revert VALUE_DOES_NOT_FIT_IN_8_BITS();
        }
        return uint8(value);
    }

    /// @notice Encode the house address, round ID, and voting strategies as immutable variables
    /// held in the contract code of the clone.
    /// @param roundId The round ID
    function _encodeData(uint256 roundId, uint256[] memory voting) internal view returns (bytes memory) {
        return abi.encodePacked(address(this), roundId, _toUint8(voting.length), voting);
    }

    /// @notice Given a round ID, return the house strategy salt.
    /// @param roundId The round ID
    function _salt(uint256 roundId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(roundId));
    }

    /// @notice Get the initialization code hash of the provided address
    /// @param a The address
    function _codeHash(address a) public view returns (bytes32 hash) {
        assembly {
            hash := extcodehash(a)
        }
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

    /// @notice Add a round creator to the whitelist
    /// @param creator The creator to add to the whitelist
    function _addRoundCreatorToWhitelist(address creator) internal {
        isRoundCreatorWhitelisted[creator] = true;
        emit RoundCreatorAddedToWhitelist(creator);
    }

    /// @notice Remove a round creator from the whitelist
    /// @param creator The creator to remove from the whitelist
    function _removeRoundCreatorFromWhitelist(address creator) internal {
        isRoundCreatorWhitelisted[creator] = false;
        emit RoundCreatorRemovedFromWhitelist(creator);
    }

    /// @notice Add many round creators to the whitelist
    /// @param creators The creators to add to the whitelist
    function _addManyRoundCreatorsToWhitelist(address[] memory creators) internal {
        unchecked {
            uint256 numCreators = creators.length;
            for (uint256 i = 0; i < numCreators; ++i) {
                _addRoundCreatorToWhitelist(creators[i]);
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
        _messenger.sendMessageToL2(_votingStrategyRegistry, REGISTER_VOTING_STRATEGY_SELECTOR, payload);
    }

    /// @notice Reverts if any of the provided voting strategies are not whitelisted
    /// For easy duplicate checking, provided strategy hashes MUST be ordered least to greatest
    /// @param strategyHashes The voting strategy hashes
    function _requireVotingStrategiesWhitelisted(uint256[] memory strategyHashes) internal view {
        unchecked {
            uint256 votingStrategy;
            uint256 prevVotingStrategy;

            uint256 numVotingStrategies = strategyHashes.length;
            for (uint256 i = 0; i < numVotingStrategies; ++i) {
                votingStrategy = strategyHashes[i];
                _requireVotingStrategyWhitelisted(votingStrategy);

                if (votingStrategy <= prevVotingStrategy) {
                    revert DUPLICATE_VOTING_STRATEGY();
                }
                prevVotingStrategy = votingStrategy;
            }
        }
    }

    /// @notice Reverts if the voting strategy is not whitelisted
    /// @param strategyHash The voting strategy hash
    function _requireVotingStrategyWhitelisted(uint256 strategyHash) internal view {
        if (!isVotingStrategyWhitelisted[strategyHash]) {
            revert VOTING_STRATEGY_NOT_WHITELISTED();
        }
    }

    /// @notice Reverts if the round creator is not whitelisted
    /// @param creator The address of the round creator
    function _requireRoundCreatorWhitelisted(address creator) internal view {
        if (!isRoundCreatorWhitelisted[creator]) {
            revert ROUND_CREATOR_NOT_WHITELISTED();
        }
    }
}
