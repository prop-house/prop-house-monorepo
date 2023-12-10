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

/// @notice Packed asset information, which consists of an asset ID and amount
struct PackedAsset {
    uint256 assetId;
    uint256 amount;
}

/// @notice Merkle proof information for an incremental tree
struct IncrementalTreeProof {
    bytes32[] siblings;
    uint8[] pathIndices;
}

/// @notice A meta-transaction relayer address and deposit amount
struct MetaTransaction {
    address relayer;
    uint256 deposit;
}
