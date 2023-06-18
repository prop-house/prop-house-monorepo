// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { TestUtil } from './TestUtil.sol';
import { Asset } from '../../contracts/ethereum/lib/types/Common.sol';
import { IPropHouse } from '../../contracts/ethereum/interfaces/IPropHouse.sol';
import { IOwnable } from '../../contracts/ethereum/interfaces/IOwnable.sol';
import { MockHouse } from '../../contracts/ethereum/mocks/MockHouse.sol';
import { MockRound } from '../../contracts/ethereum/mocks/MockRound.sol';

contract ManagerTest is TestUtil {
    address house;
    address round;

    function setUp() public {
        setUpContract();
        alice = setUpUser(42, 1);
        bob = setUpUser(43, 2);

        manager.transferOwnership(alice.addr);

        house = address(new MockHouse('MOCK_HOUSE'));
        round = address(new MockRound('MOCK_ROUND'));
    }

    function test_registerHouse() public {
        alice.manager.registerHouse(house);

        assertTrue(alice.manager.isHouseRegistered(house));
    }

    function test_unregisterHouse() public {
        alice.manager.registerHouse(house);
        alice.manager.unregisterHouse(house);

        assertFalse(alice.manager.isHouseRegistered(house));
    }

    function test_registerRound() public {
        alice.manager.registerRound(house, round);

        assertTrue(alice.manager.isRoundRegistered(house, round));
    }

    function test_unregisterRound() public {
        alice.manager.registerRound(house, round);
        alice.manager.unregisterRound(house, round);

        assertFalse(alice.manager.isRoundRegistered(house, round));
    }

    function test_registerHouseNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));
        bob.manager.registerHouse(house);
    }

    function test_unregisterHouseNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));
        bob.manager.unregisterHouse(house);
    }

    function test_registerRoundNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));
        bob.manager.registerRound(house, round);
    }

    function test_unregisterRoundNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));
        bob.manager.unregisterRound(house, round);
    }
}
