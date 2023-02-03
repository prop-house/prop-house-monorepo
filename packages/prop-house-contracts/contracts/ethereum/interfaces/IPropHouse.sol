// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Asset } from '../lib/types/Common.sol';
import { IERC721 } from './IERC721.sol';

/// @notice Interface implemented by the Prop House entry contract
interface IPropHouse is IERC721 {
    /// @notice House creation data, including the implementation contract and config
    struct House {
        address impl;
        bytes config;
    }

    /// @notice Round creation data, including the implementation contract, config, and other metadata
    struct Round {
        address impl;
        bytes config;
        string title;
        string description;
    }

    /// @notice Thrown when an insufficient amount of ether is provided to `msg.value`
    error INSUFFICIENT_ETHER_SUPPLIED();

    /// @notice Thrown when a provided house is invalid
    error INVALID_HOUSE();

    /// @notice Thrown when a provided round is invalid
    error INVALID_ROUND();

    /// @notice Thrown when a provided house implementation is invalid
    error INVALID_HOUSE_IMPL();

    /// @notice Thrown when a round implementation contract is invalid for a house
    error INVALID_ROUND_IMPL_FOR_HOUSE();

    /// @notice Thrown when a house attempts to pull tokens from a user who has not approved it
    error HOUSE_NOT_APPROVED_BY_USER();

    /// @notice Emitted when a house is created
    /// @param house The house that the round was created on
    /// @param impl The house implementation contract address
    event HouseCreated(address indexed house, address impl);

    /// @notice Emitted when a round is created
    /// @param house The house that the round was created on
    /// @param round The round contract address
    /// @param impl The round implementation contract address
    /// @param title The round title
    /// @param description The round description
    event RoundCreated(address indexed house, address indexed round, address impl, string title, string description);

    /// @notice Returns `true` if the passed `house` address is valid
    /// @param house The house address
    function isHouse(address house) external view returns (bool);

    /// @notice Returns `true` if the passed `round` address is valid on any house
    /// @param round The round address
    function isRound(address round) external view returns (bool);
}
