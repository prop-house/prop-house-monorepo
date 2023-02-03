// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @notice Interface for the Manager contract
interface IManager {
    /// @notice Emitted when a house implementation is registered
    /// @param houseImpl The house implementation address
    event HouseRegistered(address houseImpl);

    /// @notice Emitted when a house implementation is unregistered
    /// @param houseImpl The house implementation address
    event HouseUnregistered(address houseImpl);

    /// @notice Emitted when a round implementation is registered on a house
    /// @param houseImpl The house implementation address
    /// @param roundImpl The round implementation address
    event RoundRegistered(address houseImpl, address roundImpl);

    /// @notice Emitted when a round implementation is unregistered on a house
    /// @param houseImpl The house implementation address
    /// @param roundImpl The round implementation address
    event RoundUnregistered(address houseImpl, address roundImpl);

    /// @notice Determine if a house implementation is registered
    /// @param houseImpl The house implementation address
    function isHouseRegistered(address houseImpl) external view returns (bool);

    /// @notice Determine if a round implementation is registered on the provided house
    /// @param houseImpl The house implementation address
    /// @param roundImpl The round implementation address
    function isRoundRegistered(address houseImpl, address roundImpl) external view returns (bool);
}
