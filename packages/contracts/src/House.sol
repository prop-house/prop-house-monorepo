// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@solady/tokens/ERC721.sol";
import {LibClone} from "@solady/utils/LibClone.sol";
import {CreatorPassIssuer} from "./CreatorPassIssuer.sol";

contract House is ERC721, CreatorPassIssuer {
    using LibClone for address;

    string public name;
    string public description;
    address public houseFactory;

    uint256 private constant HOUSE_OWNERSHIP_TOKEN_ID = type(uint256).max;

    modifier onlyHouseOwner() {
        require(_ownerOf(HOUSE_OWNERSHIP_TOKEN_ID) == msg.sender, "NOT_OWNER");
        _;
    }

    modifier onlyCreatorPassHolder() {
        if (_ownerOf(HOUSE_OWNERSHIP_TOKEN_ID) != msg.sender) {
            require(balanceOf(msg.sender) > 0, "NO_PASS");
        }
        _;
    }

    constructor(
        string memory _name,
        string memory _description,
        address _houseFactory
    ) {
        name = _name;
        description = _description;
        houseFactory = _houseFactory;
        _mint(_houseFactory, HOUSE_OWNERSHIP_TOKEN_ID);
    }

    function id() external view returns (uint256) {
        return uint160(address(this));
    }

    function setHouseOwner(address newOwner) external onlyHouseOwner {
        require(newOwner != address(0), "INVALID_OWNER");
        _transfer(HOUSE_OWNERSHIP_TOKEN_ID, newOwner);
    }

    function createRound(
        address roundImpl,
        string calldata roundTitle,
        address creator
    ) external onlyCreatorPassHolder returns (address round) {
        require(roundImpl != address(0), "INVALID_IMPL");
        require(creator != address(0), "INVALID_CREATOR");

        bytes memory initData = abi.encodePacked(
            address(this),
            uint8(bytes(roundTitle).length),
            roundTitle,
            creator
        );

        round = roundImpl.cloneDeterministic(initData, keccak256(abi.encodePacked(roundTitle, block.timestamp)));
        _mint(creator, uint160(round));
    }

    function cancelRound(address round) external onlyHouseOwner {
        require(round != address(0), "INVALID_ROUND");
        selfdestruct(payable(msg.sender));
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function ownerOf(uint256 tokenId) public view override returns (address) {
        if (tokenId == HOUSE_OWNERSHIP_TOKEN_ID) {
            return _ownerOf(HOUSE_OWNERSHIP_TOKEN_ID);
        }
        return super.ownerOf(tokenId);
    }

    function balanceOf(address owner) public view override returns (uint256) {
        uint256 total = 0;
        if (_ownerOf(HOUSE_OWNERSHIP_TOKEN_ID) == owner) {
            total++;
        }
        return total + super.balanceOf(owner);
    }

    function _beforeTokenTransfer(
        address to,
        uint256 tokenId,
        uint256 quantity
    ) internal override {
        require(to != address(0), "TRANSFER_TO_ZERO");
        if (tokenId == HOUSE_OWNERSHIP_TOKEN_ID) {
            require(quantity == 1, "INVALID_QUANTITY");
        }
    }

    function _ownerOf(uint256 tokenId) internal view returns (address) {
        return super.ownerOf(tokenId);
    }
}
