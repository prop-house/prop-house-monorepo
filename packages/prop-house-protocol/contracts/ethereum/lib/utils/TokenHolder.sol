// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { ERC165 } from './ERC165.sol';
import { IERC165 } from '../../interfaces/IERC165.sol';
import { ERC721TokenReceiver, ERC1155TokenReceiver } from './TokenReceiver.sol';

/// @notice A contract which properly accepts and holds ERC721 & ERC1155 tokens.
abstract contract TokenHolder is ERC721TokenReceiver, ERC1155TokenReceiver, ERC165 {
    /// @notice If the contract implements an interface
    /// @param interfaceId The interface id
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(ERC721TokenReceiver).interfaceId ||
            interfaceId == type(ERC1155TokenReceiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
