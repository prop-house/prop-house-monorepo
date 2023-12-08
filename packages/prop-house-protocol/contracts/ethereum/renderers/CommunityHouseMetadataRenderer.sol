// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IMetadataEncoder } from '../interfaces/IMetadataEncoder.sol';
import { ITokenMetadataRenderer } from '../interfaces/ITokenMetadataRenderer.sol';
import { IRound } from '../interfaces/IRound.sol';

contract CommunityHouseMetadataRenderer is ITokenMetadataRenderer {
    /// @notice A contract which holds shared metadata encoding logic
    IMetadataEncoder internal immutable _encoder;

    constructor(address encoder_) {
        _encoder = IMetadataEncoder(encoder_);
    }

    /// @notice Returns metadata for `tokenId` as a Base64-JSON blob
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        IRound round = IRound(address(uint160(tokenId)));

        string memory name = round.title();
        string memory description = 'A round created via Prop House';
        bytes memory imageURL = 'ipfs://bafkreiba3s5ymjrqaaepx65ycbyh3a23s7lrvhazn2tbokmeudkbotvol4';

        return _encoder.encodeWithImageURL(name, description, imageURL);
    }
}
