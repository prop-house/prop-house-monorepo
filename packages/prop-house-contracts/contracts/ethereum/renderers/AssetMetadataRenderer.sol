// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { ISharedMetadataRenderer } from '../interfaces/renderers/ISharedMetadataRenderer.sol';
import { ITokenMetadataRenderer } from '../interfaces/renderers/ITokenMetadataRenderer.sol';
import { AssetType } from '../lib/types/Common.sol';

contract AssetMetadataRenderer is ITokenMetadataRenderer {
    /// @notice A contract which holds shared rendering logic
    ISharedMetadataRenderer internal immutable _renderer;

    constructor(address renderer_) {
        _renderer = ISharedMetadataRenderer(renderer_);
    }

    /// @notice Returns asset metadata for `tokenId` as a Base64-JSON blob
    /// @param tokenId The token ID
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        string memory assetName = _getAssetName(tokenId);
        string memory name = string.concat(assetName, ' Deposit');
        string memory description = 'Tokens that can be redeemed for a deposited asset.';

        return _renderer.encode(name, description, _renderSVG(assetName));
    }

    /// @notice Get the asset type for the provided token ID
    /// @param tokenId The token ID
    function _getAssetType(uint256 tokenId) internal pure returns (AssetType) {
        return AssetType(tokenId >> 248);
    }

    /// @notice Get the asset name for the provided token ID
    /// @param tokenId The token ID
    function _getAssetName(uint256 tokenId) internal pure returns (string memory) {
        AssetType assetType = _getAssetType(tokenId);
        if (assetType == AssetType.Native) {
            return 'ETH';
        }
        if (assetType == AssetType.ERC20) {
            return 'ERC-20';
        }
        if (assetType == AssetType.ERC721) {
            return 'ERC-721';
        }
        if (assetType == AssetType.ERC1155) {
            return 'ERC-1155';
        }
        return 'UNKNOWN';
    }

    /// @notice Render the asset SVG with the provided asset name
    /// @param assetName The asset name
    function _renderSVG(string memory assetName) internal pure returns (bytes memory) {
        // prettier-ignore
        return abi.encodePacked(
            '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
                '<circle cx="50" cy="50" r="50" fill="#262963" />',
                '<circle cx="50" cy="50" r="46" fill="#555ABE" />',
                '<text x="50" y="50" dominant-baseline="middle" text-anchor="middle" fill="#FFF" font-family="monospace" font-size="1.3em">',
                    assetName,
                '</text>'
            '</svg>'
        );
    }
}
