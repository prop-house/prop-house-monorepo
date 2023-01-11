// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IHouseApprovalManager } from './interfaces/IHouseApprovalManager.sol';
import { AssetController } from './lib/utils/AssetController.sol';
import { IHouseStrategy } from './interfaces/IHouseStrategy.sol';
import { IHouseFactory } from './interfaces/IHouseFactory.sol';
import { IAwardRouter } from './interfaces/IAwardRouter.sol';
import { AssetType, Asset } from './lib/types/Common.sol';
import { IHouse } from './interfaces/IHouse.sol';

/// @notice A contract used to route ETH, ERC20, ERC721, & ERC1155 tokens to house strategies.
/// @dev This contract does NOT support yield bearing tokens.
contract AwardRouter is IAwardRouter, AssetController {
    /// @notice The house factory contract
    IHouseFactory public immutable factory;

    /// @notice The house award approval management contract
    IHouseApprovalManager public immutable manager;

    constructor(address _factory, address _manager) {
        factory = IHouseFactory(_factory);
        manager = IHouseApprovalManager(_manager);
    }

    /// @notice Deposit an asset to the provided house strategy
    /// @param strategy The house strategy address
    /// @param asset The asset to transfer to the strategy
    /// @dev For safety, this function validates the house strategy before the transfer
    function depositTo(address payable strategy, Asset calldata asset) external payable {
        if (!_isValidHouseStrategy(strategy)) {
            revert INVALID_HOUSE_STRATEGY();
        }
        _depositTo(msg.sender, strategy, asset);
    }

    /// @notice Deposit many assets to the provided house strategy
    /// @param strategy The house strategy address
    /// @param assets The assets to transfer to the strategy
    /// @dev For safety, this function validates the house strategy before the transfer
    function batchDepositTo(address payable strategy, Asset[] calldata assets) external payable {
        if (!_isValidHouseStrategy(strategy)) {
            revert INVALID_HOUSE_STRATEGY();
        }
        _batchDepositTo(msg.sender, strategy, assets);
    }

    /// @notice Pull an asset from a user to the provided house strategy
    /// @param user The user to pull from
    /// @param strategy The receiving house strategy address
    /// @param asset The asset to transfer to the strategy
    /// @dev This function is only callable by a user-approved house when dealing with non-native assets
    function pullTo(
        address user,
        address payable strategy,
        Asset calldata asset
    ) external payable {
        if (asset.assetType != AssetType.Native && !manager.isHouseApproved(user, msg.sender)) {
            revert HOUSE_NOT_APPROVED_BY_USER();
        }
        _depositTo(user, strategy, asset);
    }

    /// @notice Pull many assets from a user to the provided house strategy
    /// @param user The user to pull from
    /// @param strategy The receiving house strategy address
    /// @param assets The assets to transfer to the strategy
    /// @dev This function is only callable by a user-approved house when dealing with non-native assets
    function batchPullTo(
        address user,
        address payable strategy,
        Asset[] calldata assets
    ) external payable {
        if (assets.length != 1 || assets[0].assetType != AssetType.Native) {
            if (!manager.isHouseApproved(user, msg.sender)) {
                revert HOUSE_NOT_APPROVED_BY_USER();
            }
        }
        _batchDepositTo(user, strategy, assets);
    }

    /// @notice Deposit an asset to the provided house strategy
    /// @param user The user depositing the asset
    /// @param strategy The house strategy address
    /// @param asset The asset to transfer to the strategy
    function _depositTo(
        address user,
        address payable strategy,
        Asset memory asset
    ) internal {
        uint256 etherRemaining = msg.value;

        // Reduce amount of remaining ether, if necessary
        if (asset.assetType == AssetType.Native) {
            // Ensure that sufficient native tokens are still available.
            if (asset.amount > etherRemaining) {
                revert INSUFFICIENT_ETHER_SUPPLIED();
            }
            // Skip underflow check as a comparison has just been made
            unchecked {
                etherRemaining -= asset.amount;
            }
        }

        _transfer(asset, user, strategy);

        // Mint deposit tokens to the caller. These are used to recoup assets in the event
        // of claim failure or cancellation.
        IHouseStrategy(strategy).mintDepositTokens(user, _getAssetID(asset), asset.amount);

        // Return any remaining ether to the caller
        if (etherRemaining != 0) {
            _transferETH(payable(user), etherRemaining);
        }
    }

    /// @notice Deposit many assets to the provided house strategy
    /// @param user The user depositing the assets
    /// @param strategy The house strategy address
    /// @param assets The assets to transfer to the strategy
    function _batchDepositTo(
        address user,
        address payable strategy,
        Asset[] memory assets
    ) internal {
        uint256 assetCount = assets.length;

        uint256 etherRemaining = msg.value;

        uint256[] memory assetIds = new uint256[](assetCount);
        uint256[] memory assetAmounts = new uint256[](assetCount);
        for (uint256 i = 0; i < assetCount; ) {
            _transfer(assets[i], user, strategy);

            // Populate asset IDs and amounts in preparation for deposit token minting
            assetIds[i] = _getAssetID(assets[i]);
            assetAmounts[i] = assets[i].amount;

            // Reduce amount of remaining ether, if necessary
            if (assets[i].assetType == AssetType.Native) {
                // Ensure that sufficient native tokens are still available.
                if (assets[i].amount > etherRemaining) {
                    revert INSUFFICIENT_ETHER_SUPPLIED();
                }

                // Skip underflow check as a comparison has just been made
                unchecked {
                    etherRemaining -= assets[i].amount;
                }
            }

            unchecked {
                ++i;
            }
        }

        // Batch mint deposit tokens to the caller. These are used to recoup assets in the event
        // of claim failure or cancellation.
        IHouseStrategy(strategy).batchMintDepositTokens(user, assetIds, assetAmounts);

        // Return any remaining ether to the caller
        if (etherRemaining != 0) {
            _transferETH(payable(user), etherRemaining);
        }
    }

    /// @notice Returns `true` if the provided address is a valid house strategy
    /// @param strategy The house strategy to validate
    function _isValidHouseStrategy(address strategy) internal view returns (bool) {
        address house = IHouseStrategy(strategy).house();
        if (!factory.isHouse(house) || !IHouse(house).isValidHouseStrategy(strategy)) {
            return false;
        }
        return true;
    }
}
