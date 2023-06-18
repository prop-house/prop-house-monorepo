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

        house = address(new MockHouse('MOCK_HOUSE'));
        round = address(new MockRound('MOCK_ROUND'));
    }

    function testRegisterHouse() public {
        manager.registerHouse(house);

        assertEq(manager.isHouseRegistered(house), true);
    }

    function testUnregisterHouse() public {
        manager.registerHouse(house);
        manager.unregisterHouse(house);

        assertEq(manager.isHouseRegistered(house), false);
    }

    function testRegisterRound() public {
        manager.registerRound(house, round);

        assertEq(manager.isRoundRegistered(house, round), true);
    }

    function testUnregisterRound() public {
        manager.registerRound(house, round);
        manager.unregisterRound(house, round);

        assertEq(manager.isRoundRegistered(house, round), false);
    }

    function testRegisterHouseNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));

        vm.prank(address(111));
        manager.registerHouse(house);
    }

    function testUnregisterHouseNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));

        vm.prank(address(111));
        manager.unregisterHouse(house);
    }

    function testRegisterRoundNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));

        vm.prank(address(111));
        manager.registerRound(house, round);
    }

    function testUnregisterRoundNonOwnerReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IOwnable.ONLY_OWNER.selector));

        vm.prank(address(111));
        manager.unregisterRound(house, round);
    }
}
