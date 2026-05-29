// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@solady/tokens/ERC1155.sol";

contract CreatorPassIssuer is ERC1155 {
    mapping(address => bool) public authorizedIssuers;

    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender], "NOT_AUTHORIZED");
        _;
    }

    constructor() ERC1155("") {}

    function setAuthorizedIssuer(
        address issuer,
        bool authorized
    ) external onlyAuthorized {
        authorizedIssuers[issuer] = authorized;
    }

    function issuePass(address to, uint256 houseId) external onlyAuthorized {
        _mint(to, houseId, 1);
    }

    function revokePass(address from, uint256 houseId) external onlyAuthorized {
        _burn(from, houseId, balanceOf(from, houseId));
    }

    function requirePass(
        address user,
        uint256 houseId
    ) external view {
        require(balanceOf(user, houseId) > 0, "NO_PASS");
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
