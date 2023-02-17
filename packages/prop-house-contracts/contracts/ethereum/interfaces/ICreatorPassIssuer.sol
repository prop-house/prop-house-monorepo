// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IERC1155 } from './IERC1155.sol';

/// @notice Interface for the Creator Pass Issuer contract
interface ICreatorPassIssuer is IERC1155 {
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

    /// @notice Issue one or more round creator passes to the provided `creator`
    /// @param creator The address who will receive the round creator token(s)
    /// @param amount The amount of creator passes to issue
    /// @dev This function is only callable by valid houses
    function issueCreatorPassesTo(address creator, uint256 amount) external;

    /// @notice Revoke one or more round creator passes from the provided `creator`
    /// @param creator The address to revoke the creator pass(es) from
    /// @param amount The amount of creator passes to revoke
    /// @dev This function is only callable by valid houses
    function revokeCreatorPassesFrom(address creator, uint256 amount) external;

    /// @notice Issue one or more round creator passes to many `creators`
    /// @param creators The addresses who will receive the round creator token(s)
    /// @param amounts The amount of creator passes to issue to each creator
    /// @dev This function is only callable by valid houses
    function issueCreatorPassesToMany(address[] calldata creators, uint256[] calldata amounts) external;

    /// @notice Revoke one or more round creator passes from many `creators`
    /// @param creators The addresses to revoke the creator pass(es) from
    /// @param amounts The amount of creator passes to revoke from each creator
    /// @dev This function is only callable by valid houses
    function revokeCreatorPassesFromMany(address[] calldata creators, uint256[] calldata amounts) external;
}
