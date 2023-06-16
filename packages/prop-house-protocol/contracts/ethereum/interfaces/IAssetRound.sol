// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IRound } from './IRound.sol';
import { PackedAsset } from '../lib/types/Common.sol';

interface IAssetRound is IRound {
    /// @notice Thrown when an asset has already been claimed
    error ALREADY_CLAIMED();

    /// @notice Thrown when the provided merkle proof is invalid
    error INVALID_MERKLE_PROOF();

    /// @notice Emitted when an asset is claimed by a winner
    /// @param proposalId The ID of the winning proposal
    /// @param claimer The address of the claimer (winner)
    /// @param recipient The recipient of the asset
    /// @param asset The ID and amount of the asset being claimed
    event AssetClaimed(uint256 proposalId, address claimer, address recipient, PackedAsset asset);

    /// @notice Emitted when an asset is claimed by a winner
    /// @param proposalId The ID of the winning proposal
    /// @param claimer The address of the claimer (winner)
    /// @param recipient The recipient of the asset
    /// @param assets The ID and amount of the assets being claimed
    event AssetsClaimed(uint256 proposalId, address claimer, address recipient, PackedAsset[] assets);
}
