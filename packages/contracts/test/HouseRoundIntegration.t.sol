// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {HouseFactory} from "../src/HouseFactory.sol";
import {House} from "../src/House.sol";
import {Round} from "../src/Round.sol";
import {ERC20} from "@solady/tokens/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("Mock", "MOCK") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract HouseRoundIntegrationTest is Test {
    HouseFactory factory;
    House house;
    Round roundImpl;
    MockToken token;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        factory = new HouseFactory();
        token = new MockToken();
        roundImpl = new Round(address(0), "", address(0));

        vm.prank(alice);
        address deployed = factory.createHouse("Alice's House", "Test house");
        house = House(deployed);
    }

    function testOwnerCanCreateRound() public {
        vm.expectEmit(true, true, false, false);
        emit ERC721.Transfer(address(0), alice, uint160(address(roundImpl)));

        vm.prank(alice);
        address round = house.createRound(
            address(roundImpl),
            "Skateboard Art Round",
            alice
        );

        assertTrue(factory.isHouse(address(house)));
    }

    function testPassHolderCanCreateRound() public {
        vm.prank(alice);
        house.issuePass(bob, uint160(address(house)));

        vm.prank(bob);
        address round = house.createRound(
            address(roundImpl),
            "Bob's Round",
            bob
        );

        assertTrue(factory.isHouse(address(house)));
    }

    function testNonPassHolderCannotCreateRound() public {
        vm.prank(bob);
        vm.expectRevert("NO_PASS");
        house.createRound(
            address(roundImpl),
            "Unauthorized Round",
            bob
        );
    }

    function testRoundDepositsAndReceipts() public {
        vm.prank(alice);
        address roundAddr = house.createRound(
            address(roundImpl),
            "Deposit Test Round",
            alice
        );
        Round round = Round(roundAddr);

        token.mint(house, 1000);
        vm.prank(house);
        token.approve(address(round), 1000);

        vm.prank(house);
        round.depositERC20(address(token), 500);

        assertEq(token.balanceOf(address(round)), 500);
        assertEq(round.totalDeposited(), 500);
    }

    function testRoundFinalizeAndReclaim() public {
        vm.prank(alice);
        address roundAddr = house.createRound(
            address(roundImpl),
            "Reclaim Test Round",
            alice
        );
        Round round = Round(roundAddr);

        token.mint(house, 1000);
        vm.prank(house);
        token.approve(address(round), 1000);

        vm.prank(house);
        round.depositERC20(address(token), 500);

        vm.prank(alice);
        round.finalize();

        uint256 beforeBalance = token.balanceOf(house);
        vm.prank(house);
        round.reclaimERC20(address(token), 500);

        assertEq(token.balanceOf(house), beforeBalance + 500);
    }

    function testMultipleRoundsPerHouse() public {
        vm.prank(alice);
        address round1 = house.createRound(
            address(roundImpl),
            "Round One",
            alice
        );

        vm.prank(alice);
        address round2 = house.createRound(
            address(roundImpl),
            "Round Two",
            alice
        );

        assertNotEq(round1, round2);
    }
}
