// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @notice A generic interface for a contract which properly accepts ERC721 tokens.
abstract contract ERC721TokenReceiver {
    function onERC721Received(address, address, uint256, bytes calldata) external virtual returns (bytes4) {
        return this.onERC721Received.selector;
    }
}

/// @notice A generic interface for a contract which properly accepts ERC1155 tokens.
abstract contract ERC1155TokenReceiver {
    function supportsInterface(bytes4 interfaceID) external view virtual returns (bool);

    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external virtual returns (bytes4) {
        return ERC1155TokenReceiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external virtual returns (bytes4) {
        return ERC1155TokenReceiver.onERC1155BatchReceived.selector;
    }
}
