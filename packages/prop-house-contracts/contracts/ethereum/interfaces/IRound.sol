// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IERC165 } from './IERC165.sol';

/// @notice Interface that must be implemented by all round types
interface IRound is IERC165 {
    /// @notice Initialize the round
    /// @param data The optional round data. If empty, round creation is deferred.
    function initialize(bytes calldata data) external;

    /// @notice The house that the round belongs to
    function house() external view returns (address);

    /// @notice The round ID
    function id() external view returns (uint256);
}
