// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LibClone} from "@solady/utils/LibClone.sol";
import {House} from "./House.sol";

contract HouseFactory {
    using LibClone for address;

    address public houseImpl;
    mapping(address => bool) public isHouse;

    event HouseCreated(address indexed house, string name, address owner);

    constructor() {
        _setImplementation(address(new House("", "", address(this))));
        authorizedIssuers[address(this)] = true;
    }

    function setAuthorizedIssuer(
        address issuer,
        bool authorized
    ) external {
        require(msg.sender == houseImpl || msg.sender == address(this), "NOT_AUTHORIZED");
        authorizedIssuers[issuer] = authorized;
    }

    function createHouse(
        string calldata _name,
        string calldata _description
    ) external returns (address house) {
        bytes memory initData = abi.encodePacked(
            _name,
            uint8(bytes(_description).length),
            _description,
            address(this)
        );

        house = houseImpl.cloneDeterministic(initData, keccak256(abi.encodePacked(_name, msg.sender)));
        isHouse[house] = true;

        House(house).setHouseOwner(msg.sender);
        emit HouseCreated(house, _name, msg.sender);
    }

    function setImplementation(address newImpl) external {
        require(newImpl != address(0), "INVALID_IMPL");
        _setImplementation(newImpl);
    }

    function _setImplementation(address impl) internal {
        houseImpl = impl;
    }

    mapping(address => bool) public authorizedIssuers;
}
