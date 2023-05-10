// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

interface ITokenMetadataRenderer {
    /// @notice Returns metadata for `tokenId` as a Base64-JSON blob
    /// @param tokenId The token ID
    function tokenURI(uint256 tokenId) external view returns (string memory);
}
