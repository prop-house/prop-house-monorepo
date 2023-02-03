// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @notice Supported asset types
enum AssetType {
    Native,
    ERC20,
    ERC721,
    ERC1155
}

/// @notice Common struct for all supported asset types
struct Asset {
    AssetType assetType;
    address token;
    uint256 identifier;
    uint256 amount;
}

/// @notice An award asset that's held in a round contract
struct Award {
    uint256 assetId;
    uint256 amount;
}
