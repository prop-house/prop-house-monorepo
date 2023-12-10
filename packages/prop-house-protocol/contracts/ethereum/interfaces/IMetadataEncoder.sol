// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

interface IMetadataEncoder {
    /// @notice Encode the name, description, and image as a Base64-JSON blob
    /// @param name The name of the item
    /// @param description A human readable description of the item
    /// @param image The raw item image data
    function encode(
        string calldata name,
        string calldata description,
        bytes calldata image
    ) external pure returns (string memory);

    /// @notice Encode the name, description, and image URL
    /// @param name The name of the item
    /// @param description A human readable description of the item
    /// @param imageURL The image url
    function encodeWithImageURL(
        string calldata name,
        string calldata description,
        bytes calldata imageURL
    ) external pure returns (string memory);

    /// @notice Encode the provided data as a Base64 blob
    /// @param mediaType The mediatype is a MIME type string, such as 'application/json'
    /// @param data The data that will be Base64 encoded
    function encode(string calldata mediaType, bytes calldata data) external pure returns (string memory);
}
