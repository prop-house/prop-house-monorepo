// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IERC1155 } from './IERC1155.sol';

/// @notice Interface for the Creator Pass Registry contract
interface ICreatorPassRegistry is IERC1155 {
    /// @notice Thrown when the caller is not a valid house contract
    error ONLY_HOUSE();

    /// @notice Thrown when the provided creator address holds no pass
    error CREATOR_HOLDS_NO_PASS();

    /// @notice Determine if the provided `creator` holds a pass to create rounds on the house
    /// @param creator The creator address
    /// @param id The house ID
    function holdsPass(address creator, uint256 id) external view returns (bool);

    /// @notice Revert if the passed `creator` does not hold a pass with the id `id`
    /// @param creator The creator address
    /// @param id The house ID
    function requirePass(address creator, uint256 id) external view;

    /// @notice Mint one or more round creator passes to the provided `creator`
    /// @param creator The address who will receive the round creator token(s)
    /// @param amount The amount of creator passes to mint
    /// @dev This function is only callable by valid houses
    function mintCreatorPassesTo(address creator, uint256 amount) external;

    /// @notice Burn one or more round creator passes from the provided `creator`
    /// @param creator The address to burn the creator pass(es) from
    /// @param amount The amount of creator passes to burn
    /// @dev This function is only callable by valid houses
    function burnCreatorPassesFrom(address creator, uint256 amount) external;

    /// @notice Mint one or more round creator passes to many `creators`
    /// @param creators The addresses who will receive the round creator token(s)
    /// @param amounts The amount of creator passes to mint to each creator
    /// @dev This function is only callable by valid houses
    function mintCreatorPassesToMany(address[] calldata creators, uint256[] calldata amounts) external;

    /// @notice Burn one or more round creator passes from many `creators`
    /// @param creators The addresses to burn the creator pass(es) from
    /// @param amounts The amount of creator passes to burn from each creator
    /// @dev This function is only callable by valid houses
    function burnCreatorPassesFromMany(address[] calldata creators, uint256[] calldata amounts) external;
}
