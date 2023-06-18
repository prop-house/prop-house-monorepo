// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { TestUtil } from './TestUtil.sol';
import { Asset } from '../../contracts/ethereum/lib/types/Common.sol';
import { Manager } from '../../contracts/ethereum/Manager.sol';
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

    function testRegisterHouse() public {
        alice.manager.registerHouse(house);

        assertEq(alice.manager.isHouseRegistered(house), true);
    }

    function testUnregisterHouse() public {
        alice.manager.registerHouse(house);
        alice.manager.unregisterHouse(house);

        assertEq(alice.manager.isHouseRegistered(house), false);
    }

    function testRegisterRound() public {
        alice.manager.registerRound(house, round);

        assertEq(alice.manager.isRoundRegistered(house, round), true);
    }

    function testUnregisterRound() public {
        alice.manager.registerRound(house, round);
        alice.manager.unregisterRound(house, round);

        assertEq(alice.manager.isRoundRegistered(house, round), false);
    }

    function testRegisterHouseNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));
        bob.manager.registerHouse(house);
    }

    function testUnregisterHouseNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));
        bob.manager.unregisterHouse(house);
    }

    function testRegisterRoundNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));
        bob.manager.registerRound(house, round);
    }

    function testUnregisterRoundNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));
        bob.manager.unregisterRound(house, round);
    }
}
