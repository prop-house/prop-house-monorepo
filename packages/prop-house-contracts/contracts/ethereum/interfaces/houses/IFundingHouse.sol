// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IHouse } from '../IHouse.sol';
import { IERC721 } from '../IERC721.sol';

/// @notice Interface for the Funding House
interface IFundingHouse is IHouse, IERC721 {
    /// @notice Voting strategy information used during house initialization
    struct VotingStrategy {
        uint256 addr;
        uint256[] params;
    }

    /// @notice Thrown when the same voting strategy is included multiple times in an array
    error DUPLICATE_VOTING_STRATEGY();

    /// @notice Thrown when attempting to use an unregistered voting strategy
    error VOTING_STRATEGY_NOT_WHITELISTED();

    /// @notice Thrown when the address attempting to initiate a round is not whitelisted
    error ROUND_CREATOR_NOT_WHITELISTED();

    /// @notice Thrown when an input value has more than 8 bits
    error VALUE_DOES_NOT_FIT_IN_8_BITS();

    /// @notice Emitted when a round creator is added to the whitelist
    /// @param creator The address of the round creator
    event RoundCreatorAddedToWhitelist(address creator);

    /// @notice Emitted when a round creator is removed from the whitelist
    /// @param creator The address of the round creator
    event RoundCreatorRemovedFromWhitelist(address creator);

    /// @notice Emitted when a voting strategy is added to the whitelist
    /// @param strategyHash The keccak256 hash of the added strategy address and params
    /// @param strategy The Starknet voting strategy contract address
    /// @param params The voting strategy parameters
    event VotingStrategyAddedToWhitelist(uint256 strategyHash, uint256 strategy, uint256[] params);

    /// @notice Emitted when a voting strategy is removed from the whitelist
    /// @param strategyHash The keccak256 hash of the removed strategy address and params
    event VotingStrategyRemovedFromWhitelist(uint256 strategyHash);

    /// @notice Emitted when a funding round is created
    /// @param roundId The ID of the funding round
    /// @param voting The selected voting strategy IDs
    /// @param title The round title
    /// @param description The round description
    /// @param strategy The house strategy implementation contract used by the round
    /// @param round The round contract address
    event RoundCreated(
        uint256 indexed roundId,
        uint256[] voting,
        string title,
        string description,
        address strategy,
        address round
    );
}
