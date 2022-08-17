// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { TestUtil } from './TestUtil.sol';

contract VaultTest is TestUtil {
    function setUp() public {
        setUpContract();
        alice = setUpUser(42, 1);
    }

    function testERC20BalanceIsCorrectFollowingDeposit() public {
        uint256 amount = 100;

        alice.vault.depositERC20(erc20, amount);
        assertEq(alice.vault.erc20Balance(alice.addr, erc20), amount);
    }

    function testERC721BalanceIsCorrectFollowingDeposit() public {
        uint256 tokenId = 1;

        alice.vault.depositERC721(erc721, tokenId);
        assertEq(alice.vault.erc721Balance(alice.addr, erc721, tokenId), 1);
    }

    function testERC1155BalanceIsCorrectFollowingDeposit() public {
        uint256 tokenId = 1;
        uint256 amount = 100;

        alice.vault.depositERC1155(erc1155, tokenId, amount);
        assertEq(alice.vault.erc1155Balance(alice.addr, erc1155, tokenId), amount);
    }
}
