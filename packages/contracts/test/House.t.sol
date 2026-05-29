// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {HouseFactory} from "../src/HouseFactory.sol";
import {House} from "../src/House.sol";

contract HouseTest is Test {
    HouseFactory factory;
    House house;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        factory = new HouseFactory();

        vm.prank(alice);
        address deployed = factory.createHouse("Alice's House", "Test house");
        house = House(deployed);
    }

    function testOwnerCanSetNewOwner() public {
        vm.prank(alice);
        house.setHouseOwner(bob);

        assertEq(house.ownerOf(type(uint256).max), bob);
    }

    function testNonOwnerCannotSetOwner() public {
        vm.prank(bob);
        vm.expectRevert("NOT_OWNER");
        house.setHouseOwner(bob);
    }

    function testOwnerCanIssuePass() public {
        vm.prank(alice);
        house.issuePass(bob, uint160(address(house)));

        assertEq(house.balanceOf(bob, uint160(address(house))), 1);
    }

    function testNonOwnerCannotIssuePass() public {
        vm.prank(bob);
        vm.expectRevert("NOT_AUTHORIZED");
        house.issuePass(alice, uint160(address(house)));
    }

    function testOwnerCanRevokePass() public {
        vm.prank(alice);
        house.issuePass(bob, uint160(address(house)));

        vm.prank(alice);
        house.revokePass(bob, uint160(address(house)));

        assertEq(house.balanceOf(bob, uint160(address(house))), 0);
    }

    function testRequirePassFailsWithoutPass() public {
        vm.expectRevert("NO_PASS");
        house.requirePass(bob, uint160(address(house)));
    }

    function testRequirePassSucceedsWithPass() public {
        vm.prank(alice);
        house.issuePass(bob, uint160(address(house)));

        house.requirePass(bob, uint160(address(house)));
    }

    function testHouseId() public view {
        assertEq(house.id(), uint160(address(house)));
    }
}
