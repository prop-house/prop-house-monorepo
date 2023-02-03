// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

/// @notice Interface that must be implemented by all round types
interface IRound {
    /// @notice Initialize the round
    /// @param data The optional round data. If empty, round creation is deferred.
    function initialize(bytes calldata data) external;

    /// @notice Mint deposit tokens to the provided `to` address
    function mintDepositTokens(
        address to,
        uint256 id,
        uint256 amount
    ) external;

    /// @notice Batch mint deposit tokens to the provided `to` address
    function batchMintDepositTokens(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external;

    /// @notice The house that the round belongs to
    function house() external view returns (address);

    /// @notice The round ID
    function id() external view returns (uint256);
}
