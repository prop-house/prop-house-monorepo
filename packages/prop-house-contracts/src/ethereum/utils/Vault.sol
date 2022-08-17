// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { IERC721 } from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import { IERC1155 } from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import { SafeERC20 } from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import { ERC721Holder } from '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import { ERC1155Holder } from '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import { VaultStorage } from './storage/VaultStorage.sol';
import { ETH_ADDRESS } from '../constants/Token.sol';
import { IVault } from '../interfaces/IVault.sol';

contract Vault is IVault, VaultStorage, ERC721Holder, ERC1155Holder {
    using SafeERC20 for IERC20;

    bytes4 internal constant ETH_SELECTOR = bytes4(keccak256('ETH()'));
    bytes4 internal constant ERC20_SELECTOR = bytes4(keccak256('ERC20Token(address)'));
    bytes4 internal constant ERC721_SELECTOR = bytes4(keccak256('ERC721Token(address,uint256)'));
    bytes4 internal constant ERC1155_SELECTOR = bytes4(keccak256('ERC1155Token(address,uint256)'));

    /// @notice Deposit ETH
    function depositETH() external payable {
        _increaseBalance(msg.sender, ETH_SELECTOR, msg.value);
        emit Deposit(msg.sender, ETH_SELECTOR, ETH_ADDRESS, msg.value);
    }

    /// @notice Deposit ERC20 tokens
    /// @param token The token address
    /// @param amount The token amount
    function depositERC20(address token, uint256 amount) public {
        bytes32 assetId = _getAssetId(ERC20_SELECTOR, token);
        _increaseBalance(msg.sender, assetId, amount);

        // Pull the ERC20 tokens
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        emit Deposit(msg.sender, ERC20_SELECTOR, token, amount);
    }

    /// @notice Batch deposit ERC20 tokens
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

    /// @notice Deposit an ERC721 token
    /// @param token The token address
    /// @param tokenId The token ID
    function depositERC721(address token, uint256 tokenId) public {
        bytes32 assetId = _getAssetId(ERC721_SELECTOR, token, tokenId);
        _increaseBalance(msg.sender, assetId, 1);

        // Pull the ERC721 token
        IERC721(token).safeTransferFrom(msg.sender, address(this), tokenId);

        emit DepositWithTokenId(msg.sender, ERC721_SELECTOR, token, tokenId, 1);
    }

    /// @notice Batch deposit ERC721 tokens
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

    /// @notice Deposit ERC1155 tokens
    /// @param token The token address
    /// @param tokenId The token ID
    /// @param amount The token amount
    function depositERC1155(
        address token,
        uint256 tokenId,
        uint256 amount
    ) public {
        bytes32 assetId = _getAssetId(ERC1155_SELECTOR, token, tokenId);
        _increaseBalance(msg.sender, assetId, amount);

        // Pull the ERC1155 tokens
        IERC1155(token).safeTransferFrom(msg.sender, address(this), tokenId, amount, new bytes(0));

        emit DepositWithTokenId(msg.sender, ERC1155_SELECTOR, token, tokenId, amount);
    }

    /// @notice Betch deposit ERC1155 tokens
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

    /// @notice Withdraw ETH to a recipient address
    /// @param amount The amount of ETH to withdraw
    /// @param recipient The withdrawal recipient
    function withdrawETHTo(uint256 amount, address recipient) public payable {
        if (amount > ethBalance(msg.sender)) {
            revert InsufficientBalance();
        }
        _decreaseBalance(msg.sender, ETH_SELECTOR, amount);

        // Process the ETH withdrawal
        (bool success, ) = recipient.call{ value: amount, gas: 30_000 }(new bytes(0));
        if (!success) {
            revert WithdrawalFailed();
        }

        emit Withdrawal(msg.sender, ETH_SELECTOR, ETH_ADDRESS, amount, recipient);
    }

    /// @notice Withdraw ETH to the caller
    /// @param amount The amount of ETH to withdraw
    function withdrawETH(uint256 amount) external payable {
        withdrawETHTo(amount, msg.sender);
    }

    /// @notice Withdraw ERC20 tokens to a recipient address
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
        bytes32 assetId = _getAssetId(ERC20_SELECTOR, token);
        _decreaseBalance(msg.sender, assetId, amount);

        // Process the ERC20 withdrawal
        IERC20(token).safeTransfer(recipient, amount);

        emit Withdrawal(msg.sender, ERC20_SELECTOR, token, amount, recipient);
    }

    /// @notice Withdraw ERC20 tokens to the caller
    /// @param token The token to withdraw
    /// @param amount The amount to withdraw
    function withdrawERC20(address token, uint256 amount) external {
        withdrawERC20To(token, amount, msg.sender);
    }

    /// @notice Withdraw an ERC721 token to a recipient address
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
        bytes32 assetId = _getAssetId(ERC721_SELECTOR, token, tokenId);
        _decreaseBalance(msg.sender, assetId, 1);

        // Process the ERC721 withdrawal
        IERC721(token).safeTransferFrom(address(this), recipient, tokenId);

        emit WithdrawalWithTokenId(msg.sender, ERC721_SELECTOR, token, tokenId, 1, recipient);
    }

    /// @notice Withdraw an ERC721 token to the caller
    /// @param token The token to withdraw
    /// @param tokenId The ID of the token to withdraw
    function withdrawERC721(address token, uint256 tokenId) external {
        withdrawERC721To(token, tokenId, msg.sender);
    }

    /// @notice Withdraw ERC1155 tokens to a recipient address
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
        bytes32 assetId = _getAssetId(ERC1155_SELECTOR, token, tokenId);
        _decreaseBalance(msg.sender, assetId, amount);

        // Process the ERC1155 withdrawal
        IERC1155(token).safeTransferFrom(address(this), recipient, tokenId, amount, new bytes(0));

        emit WithdrawalWithTokenId(msg.sender, ERC1155_SELECTOR, token, tokenId, amount, recipient);
    }

    /// @notice Withdraw ERC1155 tokens to the caller
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

    /// @notice Fetch an account's ETH balance
    /// @param account The account address
    function ethBalance(address account) public view returns (uint256) {
        return _balanceOf(account, ETH_SELECTOR);
    }

    /// @notice Fetch an account's ERC20 balance
    /// @param account The account address
    /// @param token The token address
    function erc20Balance(address account, address token) public view returns (uint256) {
        return _balanceOf(account, _getAssetId(ERC20_SELECTOR, token));
    }

    /// @notice Fetch an account's ERC721 balance
    /// @param account The account address
    /// @param token The token address
    /// @param tokenId The token ID
    function erc721Balance(
        address account,
        address token,
        uint256 tokenId
    ) public view returns (uint256) {
        return _balanceOf(account, _getAssetId(ERC721_SELECTOR, token, tokenId));
    }

    /// @notice Fetch an account's ERC1155 balance
    /// @param account The account address
    /// @param token The token address
    /// @param tokenId The token ID
    function erc1155Balance(
        address account,
        address token,
        uint256 tokenId
    ) public view returns (uint256) {
        return _balanceOf(account, _getAssetId(ERC1155_SELECTOR, token, tokenId));
    }

    /// @notice Fetch an account's balance
    /// @param account The account address
    /// @param assetId The asset ID
    function _balanceOf(address account, bytes32 assetId) internal view returns (uint256) {
        return _balances[account][assetId];
    }

    /// @notice Get the asset ID for asset type and token pairing
    /// @param assetType The asset type
    /// @param token The token address
    function _getAssetId(bytes4 assetType, address token) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(assetType, token));
    }

    /// @notice Get the asset ID for asset type and token pairing with a token ID
    /// @param assetType The asset type
    /// @param token The token address
    /// @param tokenId The token ID
    function _getAssetId(
        bytes4 assetType,
        address token,
        uint256 tokenId
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(assetType, token, tokenId));
    }

    /// @notice Increase an account's asset ID balance
    /// @param account The account address
    /// @param assetId The asset ID
    /// @param amount The increase amount
    function _increaseBalance(
        address account,
        bytes32 assetId,
        uint256 amount
    ) internal {
        _balances[account][assetId] += amount;
    }

    /// @notice Decrease an account's asset ID balance
    /// @param account The account address
    /// @param assetId The asset ID
    /// @param amount The decrease amount
    function _decreaseBalance(
        address account,
        bytes32 assetId,
        uint256 amount
    ) internal {
        _balances[account][assetId] -= amount;
    }
}
