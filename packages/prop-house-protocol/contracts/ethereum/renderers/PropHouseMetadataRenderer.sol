// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { ITokenMetadataRenderer } from '../interfaces/ITokenMetadataRenderer.sol';
import { IERC721 } from '../interfaces/IERC721.sol';

contract PropHouseMetadataRenderer is ITokenMetadataRenderer {
    /// @notice Returns the house metadata for `tokenId`
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        return IERC721(address(uint160(tokenId))).contractURI();
    }
}
