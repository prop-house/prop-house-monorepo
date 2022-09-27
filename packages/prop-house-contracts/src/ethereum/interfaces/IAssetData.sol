// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

/// @notice Interface of supported asset data
interface IAssetData {
    /// @notice Function signature for encoding ETH assetData
    function ETH() external;

    /// @notice Function signature for encoding ERC20 assetData
    /// @param tokenAddress Address of ERC20Token contract
    function ERC20Token(address tokenAddress) external;

    /// @notice Function signature for encoding ERC721 assetData
    /// @param tokenAddress Address of ERC721 token contract
    /// @param tokenId Id of ERC721 token to be transferred
    function ERC721Token(address tokenAddress, uint256 tokenId) external;

    /// @notice Function signature for encoding ERC1155 assetData
    /// @param tokenAddress Address of ERC1155 token contract
    /// @param tokenId ID of token to be transferred
    function ERC1155Token(address tokenAddress, uint256 tokenId) external;
}
