// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

library ImmutableStrings {
    type ImmutableString is uint256;

    /// @notice Thrown when the input length is greater than or equal to 32
    error LENGTH_GTE_32();

    /// @dev Converts a standard string to an immutable string
    /// @param input The standard string
    function toImmutableString(string memory input) internal pure returns (ImmutableString) {
        if (bytes(input).length >= 32) {
            revert LENGTH_GTE_32();
        }
        return ImmutableString.wrap(uint256(bytes32(bytes(input)) | bytes32(bytes(input).length)));
    }

    /// @dev Converts an immutable string to a standard string
    /// @param input The immutable string
    function toString(ImmutableString input) internal pure returns (string memory) {
        uint256 unwrapped = ImmutableString.unwrap(input);
        uint256 len = unwrapped & 255;
        uint256 readNoLength = (unwrapped >> 8) << 8;
        string memory res = string(abi.encode(readNoLength));
        assembly {
            mstore(res, len) // "res" points to the length, not the offset.
        }
        return res;
    }
}
