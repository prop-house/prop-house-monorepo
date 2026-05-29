// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {HouseFactory} from "../src/HouseFactory.sol";
import {House} from "../src/House.sol";

contract HouseFactoryTest is Test {
    HouseFactory factory;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        factory = new HouseFactory();
    }

    function testCreateHouse() public {
        vm.prank(alice);
        address house = factory.createHouse("Alice's House", "Test house");

        assertTrue(factory.isHouse(house));
        assertEq(House(house).name(), "Alice's House");
        assertEq(House(house).description(), "Test house");
    }

    function testOwnerIsCreator() public {
        vm.prank(alice);
        address house = factory.createHouse("Alice's House", "Test house");

        assertEq(House(house).ownerOf(type(uint256).max), alice);
    }

    function testMultipleHouses() public {
        vm.prank(alice);
        address house1 = factory.createHouse("House 1", "First");

        vm.prank(bob);
        address house2 = factory.createHouse("Bob's House", "Second");

        assertNotEq(house1, house2);
        assertEq(House(house1).name(), "House 1");
        assertEq(House(house2).name(), "Bob's House");
    }

    function testFactoryIsAuthorizedIssuer() public {
        assertTrue(factory.authorizedIssuers(address(factory)));
    }
}
