// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {LilRounds} from "../src/LilRounds.sol";

contract LilRoundsTest is Test {
    LilRounds public rounds;

    function setUp() public {
        rounds = new LilRounds();
    }

    function testName() public view {
        assertEq(rounds.name(), "LilRounds");
    }
}
