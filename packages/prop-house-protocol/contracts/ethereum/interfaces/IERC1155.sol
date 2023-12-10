// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @title IERC1155
/// @notice The external ERC1155 events, errors, and functions
interface IERC1155 {
    /// @notice Thrown when the caller is not authorized
    error NOT_AUTHORIZED();

    /// @notice Thrown when the receiver is the zero address or fails to accept the transfer
    error UNSAFE_RECIPIENT();

    /// @notice Thrown when provided array lengths are not equal
    error LENGTH_MISMATCH();

    /// @notice Emitted when `value` tokens of token type `id` are transferred from `from` to `to` by `operator`
    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);

    /// @notice Equivalent to multiple {TransferSingle} events, where `operator`, `from` and `to` are the same for all transfers
    event TransferBatch(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256[] ids,
        uint256[] values
    );

    /// @notice Emitted when `account` grants or revokes permission to `operator` to transfer their tokens, according to
    /// `approved`
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);

    /// @notice Emitted when the URI for token type `id` changes to `value`, if it is a non-programmatic URI
    event URI(string value, uint256 indexed id);

    /// @notice Returns the amount of tokens of token type `id` owned by `account`
    function balanceOf(address account, uint256 id) external view returns (uint256);

    /// @notice Batched version of {balanceOf}
    function balanceOfBatch(
        address[] calldata accounts,
        uint256[] calldata ids
    ) external view returns (uint256[] memory);

    /// @notice Grants or revokes permission to `operator` to transfer the caller's tokens, according to `approved`
    function setApprovalForAll(address operator, bool approved) external;

    /// @notice Returns true if `operator` is approved to transfer `account`'s tokens
    function isApprovedForAll(address account, address operator) external view returns (bool);

    /// @notice Transfers `amount` tokens of token type `id` from `from` to `to`
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;

    /// @notice Batched version of {safeTransferFrom}
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external;
}
