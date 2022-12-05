// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IStrategyValidator } from './interfaces/IStrategyValidator.sol';
import { IFundingHouse } from '../houses/interfaces/IFundingHouse.sol';
import { Uint256Utils } from '../utils/Uint256Utils.sol';

contract InfiniteFundingRoundStrategyValidator is IStrategyValidator {
    using { Uint256Utils.split } for uint256;
    using { Uint256Utils.toUint256 } for address;

    /// @notice Thrown when the quorum is zero
    error QuorumMustBeGreaterThanZero();

    /// @notice Thrown when the award length is zero
    error AwardLengthMustBeGreaterThanZero();

    /// @notice The hash of the house strategy on Starknet
    uint256 public immutable classHash;

    /// @notice The infinite funding round house strategy params
    struct InfiniteFundingRound {
        uint248 quorum;
        uint40 startTimestamp;
    }

    constructor(uint256 _classHash) {
        classHash = _classHash;
    }

    /// @notice Validate the infinite funding round strategy `data` and return the L2 strategy class hash and params.
    /// @param data The infinite funding round config
    function getStrategyParams(bytes calldata data) external view returns (uint256[] memory params) {
        // prettier-ignore
        (address initiator, uint256 roundId, bytes32 awardHash, bytes memory config, IFundingHouse.Award[] memory awards) = abi.decode(
            data,
            (address, uint256, bytes32, bytes, IFundingHouse.Award[])
        );

        InfiniteFundingRound memory round = abi.decode(config, (InfiniteFundingRound));
        if (round.quorum == 0) {
          revert QuorumMustBeGreaterThanZero();
        }
        if (awards.length == 0) {
          revert AwardLengthMustBeGreaterThanZero();
        }

        params = new uint256[](9);
        params[0] = msg.sender.toUint256();
        params[1] = classHash;
        params[2] = 6; // Strategy Params Length
        params[3] = roundId;
        params[4] = initiator.toUint256();
        (params[5], params[6]) = uint256(awardHash).split();
        params[7] = round.quorum;
        params[8] = round.startTimestamp;

        return params;
    }
}
