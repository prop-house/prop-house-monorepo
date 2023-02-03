// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IMetadataEncoder } from '../interfaces/IMetadataEncoder.sol';
import { ITokenMetadataRenderer } from '../interfaces/ITokenMetadataRenderer.sol';

contract TimedFundingRoundMetadataRenderer is ITokenMetadataRenderer {
    /// @notice A contract which holds shared metadata encoding logic
    IMetadataEncoder internal immutable _encoder;

    constructor(address encoder_) {
        _encoder = IMetadataEncoder(encoder_);
    }

    /// @notice Returns metadata for `tokenId` as a Base64-JSON blob
    function tokenURI(uint256) external view returns (string memory) {
        bytes memory svg = 'SVG TBD';
        string memory name = 'Name TBD';
        string memory description = 'Description TBD';

        return _encoder.encode(name, description, svg);
    }
}
