// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IHouseStrategy } from './IHouseStrategy.sol';

/// @notice Interface that must be implemented by all funding house strategies
interface IFundingHouseStrategy is IHouseStrategy {
    /// @notice The funding round ID
    function roundId() external view returns (uint256);
}
