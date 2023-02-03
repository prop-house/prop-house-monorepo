// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { IERC721 } from '../../interfaces/IERC721.sol';
import { Initializable } from '../utils/Initializable.sol';
import { ERC721TokenReceiver } from '../utils/TokenReceiver.sol';
import { Address } from '../utils/Address.sol';

/// @title ERC721
/// @notice Modified from Rohan Kulkarni's work for Nouns Builder
/// Originally modified from OpenZeppelin Contracts v4.7.3 (token/ERC721/ERC721Upgradeable.sol)
/// - Uses custom errors declared in IERC721
/// - Includes contract-level metadata via `contractURI`
abstract contract ERC721 is IERC721, Initializable {
    /// @notice The token name
    string public name;

    /// @notice The token symbol
    string public symbol;

    /// @notice A contract-level metadata
    string public contractURI;

    /// @notice The token owners
    /// @dev ERC-721 token id => Owner
    mapping(uint256 => address) internal owners;

    /// @notice The owner balances
    /// @dev Owner => Balance
    mapping(address => uint256) internal balances;

    /// @notice The token approvals
    /// @dev ERC-721 token id => Manager
    mapping(uint256 => address) internal tokenApprovals;

    /// @notice The balance approvals
    /// @dev Owner => Operator => Approved
    mapping(address => mapping(address => bool)) internal operatorApprovals;

    /// @dev Initializes an ERC-721 token
    /// @param _name The ERC-721 token name
    /// @param _symbol The ERC-721 token symbol
    /// @param _contractURI The ERC-721 contract URI
    function __ERC721_init(
        string memory _name,
        string memory _symbol,
        string memory _contractURI
    ) internal onlyInitializing {
        name = _name;
        symbol = _symbol;
        contractURI = _contractURI;
    }

    /// @notice The token URI
    /// @param tokenId The ERC-721 token id
    function tokenURI(uint256 tokenId) public view virtual returns (string memory) {}

    /// @notice If the contract implements an interface
    /// @param interfaceId The interface id
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC165 Interface ID
            interfaceId == 0x80ac58cd || // ERC721 Interface ID
            interfaceId == 0x5b5e139f; // ERC721Metadata Interface ID
    }

    /// @notice The account approved to manage a token
    /// @param tokenId The ERC-721 token id
    function getApproved(uint256 tokenId) external view returns (address) {
        return tokenApprovals[tokenId];
    }

    /// @notice If an operator is authorized to manage all of an owner's tokens
    /// @param owner The owner address
    /// @param operator The operator address
    function isApprovedForAll(address owner, address operator) external view returns (bool) {
        return operatorApprovals[owner][operator];
    }

    /// @notice The number of tokens owned
    /// @param owner The owner address
    function balanceOf(address owner) public view returns (uint256) {
        if (owner == address(0)) revert ADDRESS_ZERO();

        return balances[owner];
    }

    /// @notice Returns whether `tokenId` exists.
    /// @param tokenId The ERC-721 token id
    function exists(uint256 tokenId) public view returns (bool) {
        return owners[tokenId] != address(0);
    }

    /// @notice The owner of a token
    /// @param tokenId The ERC-721 token id
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = owners[tokenId];

        if (owner == address(0)) revert INVALID_OWNER();

        return owner;
    }

    /// @notice Authorizes an account to manage a token
    /// @param to The account address
    /// @param tokenId The ERC-721 token id
    function approve(address to, uint256 tokenId) external {
        address owner = owners[tokenId];

        if (msg.sender != owner && !operatorApprovals[owner][msg.sender]) revert INVALID_APPROVAL();

        tokenApprovals[tokenId] = to;

        emit Approval(owner, to, tokenId);
    }

    /// @notice Authorizes an account to manage all tokens
    /// @param operator The account address
    /// @param approved If permission is being given or removed
    function setApprovalForAll(address operator, bool approved) external {
        operatorApprovals[msg.sender][operator] = approved;

        emit ApprovalForAll(msg.sender, operator, approved);
    }

    /// @notice Transfers a token from sender to recipient
    /// @param from The sender address
    /// @param to The recipient address
    /// @param tokenId The ERC-721 token id
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public {
        if (from != owners[tokenId]) revert INVALID_OWNER();

        if (to == address(0)) revert ADDRESS_ZERO();

        if (msg.sender != from && !operatorApprovals[from][msg.sender] && msg.sender != tokenApprovals[tokenId])
            revert INVALID_APPROVAL();

        _beforeTokenTransfer(from, to, tokenId);

        unchecked {
            --balances[from];

            ++balances[to];
        }

        owners[tokenId] = to;

        delete tokenApprovals[tokenId];

        emit Transfer(from, to, tokenId);

        _afterTokenTransfer(from, to, tokenId);
    }

    /// @notice Safe transfers a token from sender to recipient
    /// @param from The sender address
    /// @param to The recipient address
    /// @param tokenId The ERC-721 token id
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external {
        transferFrom(from, to, tokenId);

        if (
            Address.isContract(to) &&
            ERC721TokenReceiver(to).onERC721Received(msg.sender, from, tokenId, '') !=
            ERC721TokenReceiver.onERC721Received.selector
        ) revert INVALID_RECIPIENT();
    }

    /// @notice Safe transfers a token from sender to recipient with additional data
    /// @param from The sender address
    /// @param to The recipient address
    /// @param tokenId The ERC-721 token id
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external {
        transferFrom(from, to, tokenId);

        if (
            Address.isContract(to) &&
            ERC721TokenReceiver(to).onERC721Received(msg.sender, from, tokenId, data) !=
            ERC721TokenReceiver.onERC721Received.selector
        ) revert INVALID_RECIPIENT();
    }

    /// @dev Mints a token to a recipient
    /// @param to The recipient address
    /// @param tokenId The ERC-721 token id
    function _mint(address to, uint256 tokenId) internal virtual {
        if (to == address(0)) revert ADDRESS_ZERO();

        if (owners[tokenId] != address(0)) revert ALREADY_MINTED();

        _beforeTokenTransfer(address(0), to, tokenId);

        unchecked {
            ++balances[to];
        }

        owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);

        _afterTokenTransfer(address(0), to, tokenId);
    }

    /// @dev Burns a token to a recipient
    /// @param tokenId The ERC-721 token id
    function _burn(uint256 tokenId) internal virtual {
        address owner = owners[tokenId];

        if (owner == address(0)) revert NOT_MINTED();

        _beforeTokenTransfer(owner, address(0), tokenId);

        unchecked {
            --balances[owner];
        }

        delete owners[tokenId];

        delete tokenApprovals[tokenId];

        emit Transfer(owner, address(0), tokenId);

        _afterTokenTransfer(owner, address(0), tokenId);
    }

    /// @dev Hook called before a token transfer
    /// @param from The sender address
    /// @param to The recipient address
    /// @param tokenId The ERC-721 token id
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}

    /// @dev Hook called after a token transfer
    /// @param from The sender address
    /// @param to The recipient address
    /// @param tokenId The ERC-721 token id
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual {}
}
