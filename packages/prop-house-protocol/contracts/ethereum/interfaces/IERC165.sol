// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @title IERC165
/// @notice Interface of the ERC165 standard, as defined in the https://eips.ethereum.org/EIPS/eip-165[EIP].
interface IERC165 {
    /// @dev Returns true if this contract implements the interface defined by
    /// `interfaceId`. See the corresponding
    /// https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
    /// to learn more about how these ids are created.
    /// This function call must use less than 30000 gas.
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}
