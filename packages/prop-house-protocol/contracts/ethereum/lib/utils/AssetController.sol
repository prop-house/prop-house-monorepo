// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import { IERC1155 } from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import { SafeERC20 } from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import { AssetType, Asset } from '../types/Common.sol';

abstract contract AssetController {
    using SafeERC20 for IERC20;

    /// @notice Thrown when unused asset parameters are populated
    error UNUSED_ASSET_PARAMETERS();

    /// @notice Thrown when an ether transfer does not succeed
    error ETHER_TRANSFER_FAILED();

    /// @notice Thrown when the ERC721 transfer amount is not equal to one
    error INVALID_ERC721_TRANSFER_AMOUNT();

    /// @notice Thrown when an unknown asset type is provided
    error INVALID_ASSET_TYPE();

    /// @notice Thrown when no asset amount is provided
    error MISSING_ASSET_AMOUNT();

    /// @dev Returns the balance of `asset` for `account`
    /// @param asset The asset to fetch the balance of
    /// @param account The account to fetch the balance for
    function _balanceOf(Asset memory asset, address account) internal view returns (uint256) {
        if (asset.assetType == AssetType.Native) {
            return account.balance;
        }
        if (asset.assetType == AssetType.ERC20) {
            return IERC20(asset.token).balanceOf(account);
        }
        if (asset.assetType == AssetType.ERC721) {
            return IERC721(asset.token).ownerOf(asset.identifier) == account ? 1 : 0;
        }
        if (asset.assetType == AssetType.ERC1155) {
            return IERC1155(asset.token).balanceOf(account, asset.identifier);
        }
        revert INVALID_ASSET_TYPE();
    }

    /// @dev Transfer a given asset from the provided `from` address to the `to` address
    /// @param asset The asset to transfer, including the asset amount
    /// @param source The account supplying the asset
    /// @param recipient The asset recipient
    function _transfer(Asset memory asset, address source, address payable recipient) internal {
        if (asset.assetType == AssetType.Native) {
            // Ensure neither the token nor the identifier parameters are set
            if ((uint160(asset.token) | asset.identifier) != 0) {
                revert UNUSED_ASSET_PARAMETERS();
            }

            _transferETH(recipient, asset.amount);
        } else if (asset.assetType == AssetType.ERC20) {
            // Ensure that no identifier is supplied
            if (asset.identifier != 0) {
                revert UNUSED_ASSET_PARAMETERS();
            }

            _transferERC20(asset.token, source, recipient, asset.amount);
        } else if (asset.assetType == AssetType.ERC721) {
            _transferERC721(asset.token, asset.identifier, source, recipient, asset.amount);
        } else if (asset.assetType == AssetType.ERC1155) {
            _transferERC1155(asset.token, asset.identifier, source, recipient, asset.amount);
        } else {
            revert INVALID_ASSET_TYPE();
        }
    }

    /// @notice Transfers one or more assets from the provided `from` address to the `to` address
    /// @param assets The assets to transfer, including the asset amounts
    /// @param source The account supplying the assets
    /// @param recipient The asset recipient
    function _transferMany(Asset[] memory assets, address source, address payable recipient) internal {
        uint256 assetCount = assets.length;
        for (uint256 i = 0; i < assetCount; ) {
            _transfer(assets[i], source, recipient);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Transfers ETH to a recipient address
    /// @param recipient The transfer recipient
    /// @param amount The amount of ETH to transfer
    function _transferETH(address payable recipient, uint256 amount) internal {
        _assertNonZeroAmount(amount);

        bool success;
        assembly {
            success := call(10000, recipient, amount, 0, 0, 0, 0)
        }
        if (!success) {
            revert ETHER_TRANSFER_FAILED();
        }
    }

    /// @notice Transfers ERC20 tokens from a provided account to a recipient address
    /// @param token The token to transfer
    /// @param source The transfer source
    /// @param recipient The transfer recipient
    /// @param amount The amount to transfer
    function _transferERC20(address token, address source, address recipient, uint256 amount) internal {
        _assertNonZeroAmount(amount);

        // Use `transfer` if the source is this contract
        if (source == address(this)) {
            IERC20(token).safeTransfer(recipient, amount);
        } else {
            IERC20(token).safeTransferFrom(source, recipient, amount);
        }
    }

    /// @notice Transfers an ERC721 token to a recipient address
    /// @param token The token to transfer
    /// @param identifier The ID of the token to transfer
    /// @param source The transfer source
    /// @param recipient The transfer recipient
    /// @param amount The token amount (Must be 1)
    function _transferERC721(
        address token,
        uint256 identifier,
        address source,
        address recipient,
        uint256 amount
    ) internal {
        if (amount != 1) {
            revert INVALID_ERC721_TRANSFER_AMOUNT();
        }
        IERC721(token).transferFrom(source, recipient, identifier);
    }

    /// @notice Transfers ERC1155 tokens to a recipient address
    /// @param token The token to transfer
    /// @param identifier The ID of the token to transfer
    /// @param source The transfer source
    /// @param recipient The transfer recipient
    /// @param amount The amount to transfer
    function _transferERC1155(
        address token,
        uint256 identifier,
        address source,
        address recipient,
        uint256 amount
    ) internal {
        _assertNonZeroAmount(amount);

        IERC1155(token).safeTransferFrom(source, recipient, identifier, amount, new bytes(0));
    }

    /**
     * @dev Ensure that a given asset amount is not zero
     * @param amount The amount to check
     */
    function _assertNonZeroAmount(uint256 amount) internal pure {
        // Revert if the supplied amount is equal to zero
        if (amount == 0) {
            revert MISSING_ASSET_AMOUNT();
        }
    }
}
