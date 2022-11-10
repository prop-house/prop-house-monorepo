// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { TestUtil } from './TestUtil.sol';

contract VaultTest is TestUtil {
    function setUp() public {
        setUpContract();
        alice = setUpUser(42, 1);
    }

    function testETHBalanceIsCorrectFollowingDeposit() public {
        uint256 amount = 100;

        alice.vault.depositETH{ value: amount }();
        assertEq(alice.vault.ethBalance(alice.addr), amount);
    }

    function testETHBalanceIsCorrectFollowingBatchDeposit() public {
        uint256 amount = 100;

        bytes memory depositETH = abi.encodeCall(alice.vault.depositETH, ());

        bytes[] memory data = new bytes[](2);
        data[0] = depositETH;
        data[1] = depositETH;

        assertEq(alice.vault.ethBalance(alice.addr), 0);

        alice.vault.batch{ value: amount }(data);

        assertEq(alice.vault.ethBalance(alice.addr), amount);
    }

    function testERC20BalanceIsCorrectFollowingDeposit() public {
        uint256 amount = 100;

        alice.vault.depositERC20(erc20, amount);
        assertEq(alice.vault.erc20Balance(alice.addr, erc20), amount);
    }

    function testERC20BalanceIsCorrectFollowingBatchDeposit() public {
        uint256 amount = 100;

        bytes memory depositERC20 = abi.encodeCall(alice.vault.depositERC20, (erc20, amount));

        assertEq(alice.vault.erc20Balance(alice.addr, erc20), 0);

        bytes[] memory data = new bytes[](2);
        data[0] = depositERC20;
        data[1] = depositERC20;

        alice.vault.batch(data);

        assertEq(alice.vault.erc20Balance(alice.addr, erc20), amount * data.length);
    }

    function testERC721BalanceIsCorrectFollowingDeposit() public {
        uint256 tokenId = 1;

        alice.vault.depositERC721(erc721, tokenId);
        assertEq(alice.vault.erc721Balance(alice.addr, erc721, tokenId), 1);
    }

    function testERC721BalanceIsCorrectFollowingBatchlDeposit() public {
        alice.erc721.mint(alice.addr, 2);

        assertEq(alice.vault.erc721Balance(alice.addr, erc721, 1), 0);
        assertEq(alice.vault.erc721Balance(alice.addr, erc721, 2), 0);

        bytes[] memory data = new bytes[](2);
        data[0] = abi.encodeCall(alice.vault.depositERC721, (erc721, 1));
        data[1] = abi.encodeCall(alice.vault.depositERC721, (erc721, 2));

        alice.vault.batch(data);

        assertEq(alice.vault.erc721Balance(alice.addr, erc721, 1), 1);
        assertEq(alice.vault.erc721Balance(alice.addr, erc721, 2), 1);
    }

    function testERC1155BalanceIsCorrectFollowingDeposit() public {
        uint256 tokenId = 1;
        uint256 amount = 100;

        alice.vault.depositERC1155(erc1155, tokenId, amount);
        assertEq(alice.vault.erc1155Balance(alice.addr, erc1155, tokenId), amount);
    }

    function testERC1155BalanceIsCorrectFollowingBatchDeposit() public {
        uint256 tokenId = 1;
        uint256 amount = 100;

        bytes memory depositERC1155 = abi.encodeCall(alice.vault.depositERC1155, (erc1155, tokenId, amount));

        assertEq(alice.vault.erc1155Balance(alice.addr, erc1155, tokenId), 0);

        bytes[] memory data = new bytes[](2);
        data[0] = depositERC1155;
        data[1] = depositERC1155;

        alice.vault.batch(data);

        assertEq(alice.vault.erc1155Balance(alice.addr, erc1155, tokenId), amount * data.length);
    }
}
