// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { Test } from 'forge-std/Test.sol';
import { Blacksmith } from './blacksmith/Blacksmith.sol';
import { Messenger } from '../../contracts/ethereum/Messenger.sol';
import { CreatorPassIssuer } from '../../contracts/ethereum/CreatorPassIssuer.sol';
import { CommunityHouse } from '../../contracts/ethereum/houses/CommunityHouse.sol';
import { TimedRound } from '../../contracts/ethereum/rounds/TimedRound.sol';
import { InfiniteRound } from '../../contracts/ethereum/rounds/InfiniteRound.sol';
import { MockStarknetMessaging } from '../../contracts/ethereum/mocks/MockStarknetMessaging.sol';
import { MockERC20, MockERC20BS } from './blacksmith/MockERC20.bs.sol';
import { MockERC721, MockERC721BS } from './blacksmith/MockERC721.bs.sol';
import { MockERC1155, MockERC1155BS } from './blacksmith/MockERC1155.bs.sol';
import { Manager, ManagerBS } from './blacksmith/Manager.bs.sol';
import { PropHouse, PropHouseBS } from './blacksmith/PropHouse.bs.sol';

contract TestUtil is Test {
    struct User {
        address addr;
        uint256 pkey;
        Blacksmith base;
        MockERC20BS erc20;
        MockERC721BS erc721;
        MockERC1155BS erc1155;
        ManagerBS manager;
        PropHouseBS propHouse;
    }

    User alice;
    User bob;
    User carol;
    address erc20;
    address erc721;
    address erc1155;
    address starknetCore;

    Manager manager;
    PropHouse propHouse;
    Messenger messenger;
    CreatorPassIssuer creatorPassIssuer;

    address communityHouseImpl;
    address timedRoundImpl;
    address infiniteRoundImpl;

    uint256 constant INITIAL_BALANCE = 100 ether;

    function createUser(address _addr, uint256 _privateKey) public returns (User memory) {
        Blacksmith base = new Blacksmith(_addr, _privateKey);
        MockERC20BS _erc20 = new MockERC20BS(_addr, _privateKey, erc20);
        MockERC721BS _erc721 = new MockERC721BS(_addr, _privateKey, erc721);
        MockERC1155BS _erc1155 = new MockERC1155BS(_addr, _privateKey, erc1155);

        ManagerBS _manager = new ManagerBS(_addr, _privateKey, address(manager));
        PropHouseBS _propHouse = new PropHouseBS(_addr, _privateKey, address(propHouse));

        base.deal(INITIAL_BALANCE);
        return User(base.addr(), base.pkey(), base, _erc20, _erc721, _erc1155, _manager, _propHouse);
    }

    function setUpUser(uint256 privateKey, uint256 tokenId) public returns (User memory user) {
        user = createUser(address(0), privateKey);

        user.erc20.mint(user.addr, INITIAL_BALANCE);
        user.erc721.mint(user.addr, tokenId);
        user.erc1155.mint(user.addr, tokenId, INITIAL_BALANCE, '');
    }

    function setUpContract() public {
        erc20 = address(new MockERC20());
        erc721 = address(new MockERC721());
        erc1155 = address(new MockERC1155());
        starknetCore = address(new MockStarknetMessaging());

        manager = new Manager();
        propHouse = new PropHouse(address(manager));
        messenger = new Messenger(starknetCore, address(propHouse));
        creatorPassIssuer = new CreatorPassIssuer(
            address(propHouse), address(0)
        );

        communityHouseImpl = address(new CommunityHouse(
            address(propHouse), address(0), address(creatorPassIssuer)
        ));
        timedRoundImpl = address(new TimedRound(
            0, address(propHouse), starknetCore, address(messenger), 0, 0, address(0)
        ));
        infiniteRoundImpl = address(new InfiniteRound(
            0, address(propHouse), starknetCore, address(messenger), 0, 0, address(0)
        ));

        vm.label(erc20, 'ERC20');
        vm.label(erc721, 'ERC721');
        vm.label(erc1155, 'ERC1155');
        vm.label(address(manager), 'MANAGER');
        vm.label(address(propHouse), 'PROPHOUSE');
    }
}
