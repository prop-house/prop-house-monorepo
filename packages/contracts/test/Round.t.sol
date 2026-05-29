// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {Round} from "../src/Round.sol";
import {ERC20} from "@solady/tokens/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("Mock", "MOCK") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract RoundTest is Test {
    Round round;
    MockToken token;

    address house = makeAddr("house");
    address manager = makeAddr("manager");
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        token = new MockToken();
        round = new Round(house, "Test Round", manager, Round.VotingStrategy.OnePerWallet);
    }

    function testInitialState() public view {
        assertEq(uint8(round.status()), uint8(Round.Status.Active));
        assertEq(round.title(), "Test Round");
        assertEq(round.manager(), manager);
        assertEq(round.house(), house);
        assertEq(uint8(round.votingStrategy()), uint8(Round.VotingStrategy.OnePerWallet));
    }

    function testDepositETH() public {
        vm.deal(house, 10 ether);
        vm.prank(house);
        round.depositETH{value: 1 ether}();

        assertEq(address(round).balance, 1 ether);
        assertEq(round.totalDeposited(), 1 ether);
        assertEq(round.balanceOf(house, 0), 1 ether);
    }

    function testDepositERC20() public {
        token.mint(alice, 1000);
        vm.prank(alice);
        token.approve(address(round), 1000);

        vm.prank(house);
        round.depositERC20(address(token), 500);

        assertEq(token.balanceOf(address(round)), 500);
        assertEq(round.totalDeposited(), 500);
        assertEq(round.balanceOf(house, uint160(address(token))), 500);
    }

    function testCannotDepositWhenNotActive() public {
        vm.prank(manager);
        round.finalize();

        vm.deal(house, 1 ether);
        vm.prank(house);
        vm.expectRevert("NOT_ACTIVE");
        round.depositETH{value: 1 ether}();
    }

    function testCannotDepositZero() public {
        vm.prank(house);
        vm.expectRevert("ZERO_AMOUNT");
        round.depositETH{value: 0}();
    }

    function testOnlyHouseCanDeposit() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert("NOT_HOUSE");
        round.depositETH{value: 1 ether}();
    }

    function testReclaimETH() public {
        vm.deal(house, 10 ether);
        vm.prank(house);
        round.depositETH{value: 1 ether}();

        vm.prank(manager);
        round.finalize();

        uint256 beforeBalance = alice.balance;
        vm.prank(alice);
        round.reclaimETH(0);

        assertEq(address(round).balance, 1 ether);
    }

    function testReclaimERC20() public {
        token.mint(house, 1000);
        vm.prank(house);
        token.approve(address(round), 1000);

        vm.prank(house);
        round.depositERC20(address(token), 500);

        vm.prank(manager);
        round.finalize();

        uint256 beforeTokenBalance = token.balanceOf(house);
        vm.prank(house);
        round.reclaimERC20(address(token), 500);

        assertEq(token.balanceOf(house), beforeTokenBalance + 500);
        assertEq(round.totalDeposited(), 0);
    }

    function testCannotReclaimWhileActive() public {
        vm.deal(house, 10 ether);
        vm.prank(house);
        round.depositETH{value: 1 ether}();

        vm.prank(house);
        vm.expectRevert("STILL_ACTIVE");
        round.reclaimETH(1 ether);
    }

    function testFinalize() public {
        vm.prank(manager);
        round.finalize();

        assertEq(uint8(round.status()), uint8(Round.Status.Finalized));
    }

    function testCancel() public {
        vm.prank(manager);
        round.cancel();

        assertEq(uint8(round.status()), uint8(Round.Status.Cancelled));
    }

    function testOnlyManagerCanFinalize() public {
        vm.prank(alice);
        vm.expectRevert("NOT_MANAGER");
        round.finalize();
    }

    function testOnlyManagerCanCancel() public {
        vm.prank(alice);
        vm.expectRevert("NOT_MANAGER");
        round.cancel();
    }

    function testTransferManagement() public {
        vm.prank(manager);
        round.transferManagement(bob);

        assertEq(round.manager(), bob);
    }

    function testOnlyManagerCanTransferManagement() public {
        vm.prank(alice);
        vm.expectRevert("NOT_MANAGER");
        round.transferManagement(bob);
    }

    function testMultipleDeposits() public {
        vm.deal(house, 10 ether);
        vm.prank(house);
        round.depositETH{value: 1 ether}();

        vm.prank(alice);
        token.mint(alice, 1000);
        vm.prank(alice);
        token.approve(address(round), 1000);

        vm.prank(house);
        round.depositERC20(address(token), 500);

        assertEq(address(round).balance, 1 ether);
        assertEq(token.balanceOf(address(round)), 500);
    }

    function testCreateProposal() public {
        vm.expectEmit(true, true, false, false);
        emit Round.ProposalCreated(0, house);

        vm.prank(house);
        round.createProposal("Test Proposal", "Description here");

        assertEq(round.proposalCount(), 1);
        (address proposer, string memory title, , uint256 createdAt, ) = round.getProposal(0);
        assertEq(proposer, house);
        assertEq(title, "Test Proposal");
        assertTrue(createdAt > 0);
    }

    function testCannotCreateProposalWhenNotActive() public {
        vm.prank(manager);
        round.finalize();

        vm.prank(house);
        vm.expectRevert("NOT_ACTIVE");
        round.createProposal("Late Proposal", "Too late");
    }

    function testOnlyHouseCanCreateProposal() public {
        vm.prank(alice);
        vm.expectRevert("NOT_HOUSE");
        round.createProposal("Unauthorized", "Nope");
    }

    function testVoteOnePerWallet() public {
        vm.prank(house);
        round.createProposal("Test Proposal", "Description");

        vm.prank(alice);
        round.vote(0);

        assertEq(round.voteCounts(0), 1);
        assertTrue(round.hasVoted(0, alice));
    }

    function testCannotVoteTwice() public {
        vm.prank(house);
        round.createProposal("Test Proposal", "Description");

        vm.prank(alice);
        round.vote(0);

        vm.prank(alice);
        vm.expectRevert("ALREADY_VOTED");
        round.vote(0);
    }

    function testVoteOnePerToken() public {
        Round tokenRound = new Round(house, "Token Round", manager, Round.VotingStrategy.OnePerToken);

        token.mint(alice, 100);
        vm.prank(alice);
        token.approve(address(tokenRound), 100);

        vm.prank(house);
        tokenRound.depositERC20(address(token), 100);

        vm.prank(house);
        tokenRound.createProposal("Token Proposal", "Description");

        vm.prank(alice);
        tokenRound.vote(0);

        assertEq(tokenRound.voteCounts(0), 100);
    }

    function testVoteQuadratic() public {
        Round quadRound = new Round(house, "Quad Round", manager, Round.VotingStrategy.Quadratic);

        token.mint(alice, 100);
        vm.prank(alice);
        token.approve(address(quadRound), 100);

        vm.prank(house);
        quadRound.depositERC20(address(token), 100);

        vm.prank(house);
        quadRound.createProposal("Quad Proposal", "Description");

        vm.prank(alice);
        quadRound.vote(0);

        assertEq(quadRound.voteCounts(0), 10);
    }

    function testCannotVoteWithoutTokens() public {
        Round tokenRound = new Round(house, "Token Round", manager, Round.VotingStrategy.OnePerToken);

        vm.prank(house);
        tokenRound.createProposal("Token Proposal", "Description");

        vm.prank(alice);
        vm.expectRevert("NO_TOKENS");
        tokenRound.vote(0);
    }

    function testMultipleProposals() public {
        vm.prank(house);
        round.createProposal("First", "Desc 1");

        vm.prank(house);
        round.createProposal("Second", "Desc 2");

        assertEq(round.proposalCount(), 2);

        (, string memory title1, , , ) = round.getProposal(0);
        (, string memory title2, , , ) = round.getProposal(1);

        assertEq(title1, "First");
        assertEq(title2, "Second");
    }

    function testCannotVoteWhenNotActive() public {
        vm.prank(house);
        round.createProposal("Test Proposal", "Description");

        vm.prank(manager);
        round.finalize();

        vm.prank(alice);
        vm.expectRevert("NOT_ACTIVE");
        round.vote(0);
    }
}
