// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import { Test } from 'forge-std/Test.sol';
import { Blacksmith } from '../blacksmith/Blacksmith.sol';
import { Vault, VaultBS } from '../blacksmith/Vault.bs.sol';
import { MockERC20, MockERC20BS } from '../blacksmith/MockERC20.bs.sol';
import { MockERC721, MockERC721BS } from '../blacksmith/MockERC721.bs.sol';
import { MockERC1155, MockERC1155BS } from '../blacksmith/MockERC1155.bs.sol';

contract TestUtil is Test {
    struct User {
        address addr;
        uint256 pkey;
        Blacksmith base;
        VaultBS vault;
        MockERC20BS erc20;
        MockERC721BS erc721;
        MockERC1155BS erc1155;
    }

    User alice;
    User bob;
    User carol;
    address vault;
    address erc20;
    address erc721;
    address erc1155;

    uint256 constant INITIAL_BALANCE = 100 ether;

    function createUser(address _addr, uint256 _privateKey) public returns (User memory) {
        Blacksmith base = new Blacksmith(_addr, _privateKey);
        VaultBS _vault = new VaultBS(_addr, _privateKey, vault);
        MockERC20BS _erc20 = new MockERC20BS(_addr, _privateKey, erc20);
        MockERC721BS _erc721 = new MockERC721BS(_addr, _privateKey, erc721);
        MockERC1155BS _erc1155 = new MockERC1155BS(_addr, _privateKey, erc1155);

        base.deal(INITIAL_BALANCE);
        return User(base.addr(), base.pkey(), base, _vault, _erc20, _erc721, _erc1155);
    }

    function setUpUser(uint256 privateKey, uint256 tokenId) public returns (User memory user) {
        user = createUser(address(0), privateKey);

        user.erc20.approve(vault, type(uint256).max);
        user.erc721.setApprovalForAll(vault, true);
        user.erc1155.setApprovalForAll(vault, true);

        user.erc20.mint(user.addr, INITIAL_BALANCE);
        user.erc721.mint(user.addr, tokenId);
        user.erc1155.mint(user.addr, tokenId, INITIAL_BALANCE, '');
    }

    function setUpContract() public {
        vault = address(new Vault());
        erc20 = address(new MockERC20());
        erc721 = address(new MockERC721());
        erc1155 = address(new MockERC1155());

        vm.label(vault, 'Vault');
        vm.label(erc20, 'ERC20');
        vm.label(erc721, 'ERC721');
        vm.label(erc1155, 'ERC1155');
    }
}
