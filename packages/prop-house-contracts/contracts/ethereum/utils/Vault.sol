// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import { IERC1155 } from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import { SafeERC20 } from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import { ERC721Holder } from '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import { ERC1155Holder } from '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import { AssetDataUtils } from '../utils/AssetDataUtils.sol';
import { IAssetData } from '../interfaces/IAssetData.sol';
import { IVault } from '../interfaces/IVault.sol';
import { IWETH } from '../interfaces/IWETH.sol';
import { ETH_ADDRESS } from '../Constants.sol';

/// @notice A multicall-safe vault contract for depositing ETH, ERC20, ERC721, & ERC1155 tokens
abstract contract Vault is IVault, ERC721Holder, ERC1155Holder {
    using SafeERC20 for IERC20;

    /// @notice WETH token instance
    IWETH internal immutable _weth;

    /// @notice Available asset balances
    /// @dev Depositor => Asset ID => Balance
    mapping(address => mapping(bytes32 => uint256)) internal _balances;

    constructor(address weth) {
        _weth = IWETH(weth);
    }

    /// @notice Deposits ETH
    function depositETH() external payable {
        _depositETH(msg.sender);
    }

    /// @notice Deposits ERC20 tokens
    /// @param token The token address
    /// @param amount The token amount
    function depositERC20(address token, uint256 amount) public {
        bytes32 assetId = AssetDataUtils.getAssetID(IAssetData.ERC20Token.selector, token);
        _creditInternalBalance(msg.sender, assetId, amount);

        // Pull the ERC20 tokens
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        emit Deposit(msg.sender, IAssetData.ERC20Token.selector, token, amount);
    }

    /// @notice Batch deposits ERC20 tokens
    /// @param tokens The token addresses
    /// @param amounts The token amounts
    function batchDepositERC20(address[] calldata tokens, uint256[] calldata amounts) external {
        for (uint256 i = 0; i < tokens.length; ) {
            depositERC20(tokens[i], amounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Deposits an ERC721 token
    /// @param token The token address
    /// @param tokenId The token ID
    function depositERC721(address token, uint256 tokenId) public {
        bytes32 assetId = AssetDataUtils.getAssetID(IAssetData.ERC721Token.selector, token, tokenId);
        _creditInternalBalance(msg.sender, assetId, 1);

        // Pull the ERC721 token
        IERC721(token).safeTransferFrom(msg.sender, address(this), tokenId);

        emit DepositWithTokenId(msg.sender, IAssetData.ERC721Token.selector, token, tokenId, 1);
    }

    /// @notice Batch deposits ERC721 tokens
    /// @param tokens The token addresses
    /// @param tokenIds The token IDs
    function batchDepositERC721(address[] calldata tokens, uint256[] calldata tokenIds) external {
        for (uint256 i = 0; i < tokens.length; ) {
            depositERC721(tokens[i], tokenIds[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Deposits ERC1155 tokens
    /// @param token The token address
    /// @param tokenId The token ID
    /// @param amount The token amount
    function depositERC1155(
        address token,
        uint256 tokenId,
        uint256 amount
    ) public {
        bytes32 assetId = AssetDataUtils.getAssetID(IAssetData.ERC1155Token.selector, token, tokenId);
        _creditInternalBalance(msg.sender, assetId, amount);

        // Pull the ERC1155 tokens
        IERC1155(token).safeTransferFrom(msg.sender, address(this), tokenId, amount, new bytes(0));

        emit DepositWithTokenId(msg.sender, IAssetData.ERC1155Token.selector, token, tokenId, amount);
    }

    /// @notice Batch deposits ERC1155 tokens
    /// @param tokens The token addresses
    /// @param tokenIds The token IDs
    /// @param amounts The token amounts
    function batchDepositERC1155(
        address[] calldata tokens,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts
    ) external {
        for (uint256 i = 0; i < tokens.length; ) {
            depositERC1155(tokens[i], tokenIds[i], amounts[i]);
            unchecked {
                ++i;
            }
        }
    }

    /// @notice Withdraws ETH to a recipient address
    /// @param amount The amount of ETH to withdraw
    /// @param recipient The withdrawal recipient
    function withdrawETHTo(uint256 amount, address recipient) public {
        if (amount > ethBalance(msg.sender)) {
            revert InsufficientBalance();
        }
        _debitInternalBalance(msg.sender, IAssetData.ETH.selector, amount);

        // Process the ETH withdrawal
        _transferETHTo(amount, recipient);

        emit Withdrawal(msg.sender, IAssetData.ETH.selector, ETH_ADDRESS, amount, recipient);
    }

    /// @notice Withdraws ETH to the caller
    /// @param amount The amount of ETH to withdraw
    function withdrawETH(uint256 amount) external {
        withdrawETHTo(amount, msg.sender);
    }

    /// @notice Withdraws ERC20 tokens to a recipient address
    /// @param token The token to withdraw
    /// @param amount The amount to withdraw
    /// @param recipient The withdrawal recipient
    function withdrawERC20To(
        address token,
        uint256 amount,
        address recipient
    ) public {
        if (amount > erc20Balance(msg.sender, token)) {
            revert InsufficientBalance();
        }
        bytes32 assetId = AssetDataUtils.getAssetID(IAssetData.ERC20Token.selector, token);
        _debitInternalBalance(msg.sender, assetId, amount);

        // Process the ERC20 withdrawal
        _transferERC20To(token, amount, recipient);

        emit Withdrawal(msg.sender, IAssetData.ERC20Token.selector, token, amount, recipient);
    }

    /// @notice Withdraws ERC20 tokens to the caller
    /// @param token The token to withdraw
    /// @param amount The amount to withdraw
    function withdrawERC20(address token, uint256 amount) external {
        withdrawERC20To(token, amount, msg.sender);
    }

    /// @notice Withdraws an ERC721 token to a recipient address
    /// @param token The token to withdraw
    /// @param tokenId The ID of the token to withdraw
    /// @param recipient The withdrawal recipient
    function withdrawERC721To(
        address token,
        uint256 tokenId,
        address recipient
    ) public {
        if (erc721Balance(msg.sender, token, tokenId) == 0) {
            revert InsufficientBalance();
        }
        bytes32 assetId = AssetDataUtils.getAssetID(IAssetData.ERC721Token.selector, token, tokenId);
        _debitInternalBalance(msg.sender, assetId, 1);

        // Process the ERC721 withdrawal
        _transferERC721To(token, tokenId, recipient);

        emit WithdrawalWithTokenId(msg.sender, IAssetData.ERC721Token.selector, token, tokenId, 1, recipient);
    }

    /// @notice Withdraws an ERC721 token to the caller
    /// @param token The token to withdraw
    /// @param tokenId The ID of the token to withdraw
    function withdrawERC721(address token, uint256 tokenId) external {
        withdrawERC721To(token, tokenId, msg.sender);
    }

    /// @notice Withdraws ERC1155 tokens to a recipient address
    /// @param token The token to withdraw
    /// @param tokenId The ID of the token to withdraw
    /// @param amount The amount to withdraw
    /// @param recipient The withdrawal recipient
    function withdrawERC1155To(
        address token,
        uint256 tokenId,
        uint256 amount,
        address recipient
    ) public {
        if (amount > erc1155Balance(msg.sender, token, tokenId)) {
            revert InsufficientBalance();
        }
        bytes32 assetId = AssetDataUtils.getAssetID(IAssetData.ERC1155Token.selector, token, tokenId);
        _debitInternalBalance(msg.sender, assetId, amount);

        // Process the ERC1155 withdrawal
        _transferERC1155To(token, tokenId, amount, recipient);

        emit WithdrawalWithTokenId(msg.sender, IAssetData.ERC1155Token.selector, token, tokenId, amount, recipient);
    }

    /// @notice Withdraws ERC1155 tokens to the caller
    /// @param token The token to withdraw
    /// @param tokenId The ID of the token to withdraw
    /// @param amount The amount to withdraw
    function withdrawERC1155(
        address token,
        uint256 tokenId,
        uint256 amount
    ) external {
        withdrawERC1155To(token, tokenId, amount, msg.sender);
    }

    /// @notice Fetches an account's balance
    /// @param account The account address
    /// @param assetId The asset ID
    function balanceOf(address account, bytes32 assetId) public view returns (uint256) {
        return _balances[account][assetId];
    }

    /// @notice Fetches an account's ETH balance
    /// @param account The account address
    function ethBalance(address account) public view returns (uint256) {
        return balanceOf(account, IAssetData.ETH.selector);
    }

    /// @notice Fetches an account's ERC20 balance
    /// @param account The account address
    /// @param token The token address
    function erc20Balance(address account, address token) public view returns (uint256) {
        return balanceOf(account, AssetDataUtils.getAssetID(IAssetData.ERC20Token.selector, token));
    }

    /// @notice Fetches an account's ERC721 balance
    /// @param account The account address
    /// @param token The token address
    /// @param tokenId The token ID
    function erc721Balance(
        address account,
        address token,
        uint256 tokenId
    ) public view returns (uint256) {
        return balanceOf(account, AssetDataUtils.getAssetID(IAssetData.ERC721Token.selector, token, tokenId));
    }

    /// @notice Fetches an account's ERC1155 balance
    /// @param account The account address
    /// @param token The token address
    /// @param tokenId The token ID
    function erc1155Balance(
        address account,
        address token,
        uint256 tokenId
    ) public view returns (uint256) {
        return balanceOf(account, AssetDataUtils.getAssetID(IAssetData.ERC1155Token.selector, token, tokenId));
    }

    /// @notice Deposits ETH
    /// @param account The account address
    function _depositETH(address account) internal {
        uint256 value = address(this).balance;

        _weth.deposit{ value: value }();

        _creditInternalBalance(account, IAssetData.ETH.selector, value);
        emit Deposit(account, IAssetData.ETH.selector, ETH_ADDRESS, value);
    }

    /// @notice Transfers ETH to a recipient address
    /// @param amount The amount of ETH to transfer
    /// @param recipient The transfer recipient
    function _transferETHTo(uint256 amount, address recipient) internal {
        _weth.withdraw(amount);

        (bool success, ) = recipient.call{ value: amount, gas: 30_000 }(new bytes(0));
        if (!success) {
            revert TransferFailed();
        }
    }

    /// @notice Transfers ERC20 tokens to a recipient address
    /// @param token The token to transfer
    /// @param amount The amount to transfer
    /// @param recipient The transfer recipient
    function _transferERC20To(
        address token,
        uint256 amount,
        address recipient
    ) internal {
        IERC20(token).safeTransfer(recipient, amount);
    }

    /// @notice Transfers an ERC721 token to a recipient address
    /// @param token The token to transfer
    /// @param tokenId The ID of the token to transfer
    /// @param recipient The transfer recipient
    function _transferERC721To(
        address token,
        uint256 tokenId,
        address recipient
    ) internal {
        IERC721(token).safeTransferFrom(address(this), recipient, tokenId);
    }

    /// @notice Transfers ERC1155 tokens to a recipient address
    /// @param token The token to transfer
    /// @param tokenId The ID of the token to transfer
    /// @param amount The amount to transfer
    /// @param recipient The transfer recipient
    function _transferERC1155To(
        address token,
        uint256 tokenId,
        uint256 amount,
        address recipient
    ) internal {
        IERC1155(token).safeTransferFrom(address(this), recipient, tokenId, amount, new bytes(0));
    }

    /// @notice Withdraws an asset to the passed `recipient`
    /// @param assetData The data describing an asset
    /// @param amount The withdrawal amount
    /// @param recipient The withdrawal recipient
    function _withdrawTo(
        bytes memory assetData,
        uint256 amount,
        address recipient
    ) internal {
        bytes4 assetType = AssetDataUtils.extractAssetType(assetData);
        if (assetType == IAssetData.ETH.selector) {
            _transferETHTo(amount, recipient);
        } else if (assetType == IAssetData.ERC20Token.selector) {
            (address token, ) = AssetDataUtils.decodeERC20AssetData(assetType, assetData);
            _transferERC20To(token, amount, recipient);
        } else if (assetType == IAssetData.ERC721Token.selector) {
            (address token, uint256 tokenId, ) = AssetDataUtils.decodeERC721AssetData(assetType, assetData);
            _transferERC721To(token, tokenId, recipient);
        } else if (assetType == IAssetData.ERC1155Token.selector) {
            (address token, uint256 tokenId, ) = AssetDataUtils.decodeERC1155AssetData(assetType, assetData);
            _transferERC1155To(token, tokenId, amount, recipient);
        } else {
            revert AssetDataUtils.InvalidAssetType();
        }
    }

    /// @notice Credits an account's internal asset ID balance
    /// @param account The account address
    /// @param assetId The asset ID
    /// @param amount The increase amount
    function _creditInternalBalance(
        address account,
        bytes32 assetId,
        uint256 amount
    ) internal {
        _balances[account][assetId] += amount;
    }

    /// @notice Debits an account's internal asset ID balance
    /// @param account The account address
    /// @param assetId The asset ID
    /// @param amount The decrease amount
    function _debitInternalBalance(
        address account,
        bytes32 assetId,
        uint256 amount
    ) internal {
        _balances[account][assetId] -= amount;
    }

    receive() external payable {
        if (msg.sender != address(_weth)) {
            revert OnlyWETH();
        }
    }
}
