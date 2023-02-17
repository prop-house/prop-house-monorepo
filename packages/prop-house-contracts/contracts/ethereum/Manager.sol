// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IManager } from './interfaces/IManager.sol';
import { Ownable } from './lib/utils/Ownable.sol';

/// @title Manager
/// @notice This contract allows the registrar to manage house and round implementations
contract Manager is IManager, Ownable {
    /// @notice Determine if a contract is a registered house implementation
    /// @dev House Address => Registered
    mapping(address => bool) private houses;

    /// @notice Determine if a contract is a registered round for a house implementation
    /// @dev House Address => Round Address => Is Registered
    mapping(address => mapping(address => bool)) private rounds;

    constructor() initializer {
        __Ownable_init(msg.sender);
    }

    /// @notice Determine if a house implementation is registered
    /// @param houseImpl The house implementation address
    function isHouseRegistered(address houseImpl) external view returns (bool) {
        return houses[houseImpl];
    }

    /// @notice Determine if a round implementation is registered on the provided house
    /// @param houseImpl The house implementation address
    /// @param roundImpl The round implementation address
    function isRoundRegistered(address houseImpl, address roundImpl) external view returns (bool) {
        return rounds[houseImpl][roundImpl];
    }

    /// @notice Register a house implementation contract
    /// @param houseImpl The house implementation address
    function registerHouse(address houseImpl) external onlyOwner {
        houses[houseImpl] = true;

        emit HouseRegistered(houseImpl);
    }

    /// @notice Unregister a house implementation contract
    /// @param houseImpl The house implementation address
    function unregisterDeployment(address houseImpl) external onlyOwner {
        delete houses[houseImpl];

        emit HouseUnregistered(houseImpl);
    }

    /// @notice Register a round implementation contract for a house
    /// @param houseImpl The house implementation address
    /// @param roundImpl The round implementation address
    function registerRound(address houseImpl, address roundImpl) external onlyOwner {
        rounds[houseImpl][roundImpl] = true;

        emit RoundRegistered(houseImpl, roundImpl);
    }

    /// @notice Unregister a round implementation contract for a house
    /// @param houseImpl The house implementation address
    /// @param roundImpl The round implementation address
    function unregisterRound(address houseImpl, address roundImpl) external onlyOwner {
        delete rounds[houseImpl][roundImpl];

        emit RoundUnregistered(houseImpl, roundImpl);
    }
}
