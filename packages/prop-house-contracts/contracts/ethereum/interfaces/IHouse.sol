// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IERC721 } from './IERC721.sol';

/// @notice Common House interface
interface IHouse is IERC721 {
    /// @notice Thrown when the caller is not the prop house contract
    error ONLY_PROP_HOUSE();

    /// @notice Thrown when the caller does not hold the house ownership token
    error ONLY_HOUSE_OWNER();

    /// @notice Initialize the house
    /// @param creator The house creator
    /// @param data Initialization data
    function initialize(address creator, bytes calldata data) external;

    /// @notice Returns `true` if the provided address is a valid round on the house
    /// @param round The round to validate
    function isRound(address round) external view returns (bool);

    /// @notice Create a new round
    /// @param impl The round implementation contract
    /// @param creator The round creator address
    function createRound(address impl, address creator) external returns (address);
}
