// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

interface IMetadataRenderer {
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

contract TimedFundingRoundMetadataRenderer is IMetadataRenderer {
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        return '';
    }
}
