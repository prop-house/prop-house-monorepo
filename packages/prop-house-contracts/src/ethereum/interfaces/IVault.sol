// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface for the Vault
interface IVault {
    /// @notice Thrown when the caller has an insufficient asset balance for the action
    error InsufficientBalance();

    /// @notice Thrown on withdrawal failure
    error WithdrawalFailed();

    /// @notice Emitted when a deposit is processed
    event Deposit(address indexed account, bytes4 assetType, address asset, uint256 amount);

    /// @notice Emitted when a deposit is processed for an asset that has a token ID
    event DepositWithTokenId(address indexed account, bytes4 assetType, address asset, uint256 tokenId, uint256 amount);

    /// @notice Emitted when a withdrawal is processed
    event Withdrawal(address indexed account, bytes4 assetType, address asset, uint256 amount, address recipient);

    /// @notice Emitted when a withdrawal is processed for an asset that has a token ID
    event WithdrawalWithTokenId(
        address indexed account,
        bytes4 assetType,
        address asset,
        uint256 tokenId,
        uint256 amount,
        address recipient
    );

    /// @notice Fetch an account's balance
    /// @param account The account address
    /// @param assetId The asset ID
    function balanceOf(address account, bytes32 assetId) external view returns (uint256);

    /// @notice Fetch an account's ETH balance
    /// @param account The account address
    function ethBalance(address account) external view returns (uint256);

    /// @notice Fetch an account's ERC20 balance
    /// @param account The account address
    /// @param token The token address
    function erc20Balance(address account, address token) external view returns (uint256);

    /// @notice Fetch an account's ERC721 balance
    /// @param account The account address
    /// @param token The token address
    /// @param tokenId The token ID
    function erc721Balance(
        address account,
        address token,
        uint256 tokenId
    ) external view returns (uint256);

    /// @notice Fetch an account's ERC1155 balance
    /// @param account The account address
    /// @param token The token address
    /// @param tokenId The token ID
    function erc1155Balance(
        address account,
        address token,
        uint256 tokenId
    ) external view returns (uint256);
}
