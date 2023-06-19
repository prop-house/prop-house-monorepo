// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { TestUtil } from './TestUtil.sol';
import { AssetController } from '../../contracts/ethereum/lib/utils/AssetController.sol';
import { Asset, AssetType } from '../../contracts/ethereum/lib/types/Common.sol';
import { IPropHouse } from '../../contracts/ethereum/interfaces/IPropHouse.sol';
import { ITimedRound } from '../../contracts/ethereum/interfaces/ITimedRound.sol';
import { MockHouse } from '../../contracts/ethereum/mocks/MockHouse.sol';
import { MockRound } from '../../contracts/ethereum/mocks/MockRound.sol';

contract PropHouseTest is TestUtil {
    address existingHouse;
    address existingRound;

    IPropHouse.House communityHouseConfig;
    IPropHouse.Round timedRoundConfig;

    function setUp() public {
        setUpContract();
        alice = setUpUser(42, 1);

        communityHouseConfig = IPropHouse.House({ impl: communityHouseImpl, config: abi.encode('Test House URI') });
        timedRoundConfig = IPropHouse.Round({
            impl: timedRoundImpl,
            config: abi.encode(validTimedRoundConfig()),
            title: 'Test Round',
            description: 'Test Round Description'
        });
        existingHouse = alice.propHouse.createHouse(communityHouseConfig);
        existingRound = alice.propHouse.createRoundOnExistingHouse(existingHouse, timedRoundConfig);
    }

    function test_createRoundOnNewHouse() public {
        (address house, address round) = alice.propHouse.createRoundOnNewHouse(communityHouseConfig, timedRoundConfig);
        assertNotEq(house, address(0));
        assertNotEq(round, address(0));
    }

    function test_createRoundOnNewHouseUnregisteredHouseReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INVALID_HOUSE_IMPL.selector));
        alice.propHouse.createRoundOnNewHouse(
            IPropHouse.House({ impl: address(111), config: abi.encode('Test House URI') }),
            timedRoundConfig
        );
    }

    function test_createRoundOnNewHouseUnregisteredRoundReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INVALID_ROUND_IMPL_FOR_HOUSE.selector));
        alice.propHouse.createRoundOnNewHouse(
            communityHouseConfig,
            IPropHouse.Round({
                impl: address(111),
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_createRoundOnNewHouseWrongHouseImplReverts() public {
        address wrongHouseImpl = address(new MockHouse('MOCK_HOUSE'));
        manager.registerHouse(wrongHouseImpl);

        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INVALID_ROUND_IMPL_FOR_HOUSE.selector));
        alice.propHouse.createRoundOnNewHouse(
            IPropHouse.House({ impl: wrongHouseImpl, config: abi.encode('Test House URI') }),
            timedRoundConfig
        );
    }

    function test_createAndFundRoundOnNewHouseWithExactETHAmount() public {
        uint256 amount = 1e18;
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse{ value: amount }(
            communityHouseConfig,
            timedRoundConfig,
            ethAsset(amount)
        );
        assertEq(round.balance, amount);
    }

    function test_createAndFundRoundOnNewHouseWithExtraETH() public {
        uint256 amount = 1e18;
        uint256 extra = 1e9;
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse{ value: amount + extra }(
            communityHouseConfig,
            timedRoundConfig,
            ethAsset(amount)
        );
        assertEq(round.balance, amount);
        assertEq(starknetCore.balance, extra); // Starknet Core uses excess ETH for L1 -> L2 message
    }

    function test_createAndFundRoundOnNewHouseWithETHNoValue() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INSUFFICIENT_ETHER_SUPPLIED.selector));

        uint256 amount = 1e18;
        alice.propHouse.createAndFundRoundOnNewHouse{ value: 0 }(
            communityHouseConfig,
            timedRoundConfig,
            ethAsset(amount)
        );
    }

    function test_createAndFundRoundOnNewHouseWithERC20s() public {
        uint256 amount = 1e18;
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse(
            communityHouseConfig,
            timedRoundConfig,
            erc20Asset(amount)
        );
        assertEq(alice.erc20.balanceOf(round), amount);
    }

    function test_createAndFundRoundOnNewHouseWithERC721() public {
        uint256 tokenId = 1;
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse(
            communityHouseConfig,
            timedRoundConfig,
            erc721Asset(tokenId)
        );
        assertEq(alice.erc721.ownerOf(tokenId), round);
    }

    function test_createAndFundRoundOnNewHouseWithERC1155() public {
        uint256 tokenId = 1;
        uint256 amount = 1e18;
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse(
            communityHouseConfig,
            timedRoundConfig,
            erc1155Asset(tokenId, amount)
        );
        assertEq(alice.erc1155.balanceOf(round, tokenId), amount);
    }

    function test_createAndFundRoundOnNewHouseWithManyAssets() public {
        uint256 tokenId = 1;
        uint256 amount = 1e18;
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse{ value: amount }(
            communityHouseConfig,
            timedRoundConfig,
            allAssets(tokenId, amount)
        );
        assertEq(round.balance, amount);
        assertEq(alice.erc20.balanceOf(round), amount);
        assertEq(alice.erc721.ownerOf(tokenId), round);
        assertEq(alice.erc1155.balanceOf(round, tokenId), amount);
    }

    function test_createRoundOnExistingHouse() public {
        address round = alice.propHouse.createRoundOnExistingHouse(existingHouse, timedRoundConfig);
        assertNotEq(round, address(0));
    }

    function test_createRoundOnExistingHouseNonExistentHouseReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INVALID_HOUSE.selector));
        alice.propHouse.createRoundOnExistingHouse(address(111), timedRoundConfig);
    }

    function test_createRoundOnExistingHouseUnregisteredRoundReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INVALID_ROUND_IMPL_FOR_HOUSE.selector));
        alice.propHouse.createRoundOnExistingHouse(
            existingHouse,
            IPropHouse.Round({
                impl: address(111),
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_createAndFundRoundOnExistingHouseWithExactETHAmount() public {
        uint256 amount = 1e18;
        address round = alice.propHouse.createAndFundRoundOnExistingHouse{ value: amount }(
            existingHouse,
            timedRoundConfig,
            ethAsset(amount)
        );
        assertEq(round.balance, amount);
    }

    function test_createAndFundRoundOnExistingHouseWithExtraETH() public {
        uint256 amount = 1e18;
        uint256 extra = 1e9;
        address round = alice.propHouse.createAndFundRoundOnExistingHouse{ value: amount + extra }(
            existingHouse,
            timedRoundConfig,
            ethAsset(amount)
        );
        assertEq(round.balance, amount);
        assertEq(starknetCore.balance, extra); // Starknet Core uses excess ETH for L1 -> L2 message
    }

    function test_createAndFundRoundOnExistingHouseWithETHNoValue() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INSUFFICIENT_ETHER_SUPPLIED.selector));

        uint256 amount = 1e18;
        alice.propHouse.createAndFundRoundOnExistingHouse{ value: 0 }(
            existingHouse,
            timedRoundConfig,
            ethAsset(amount)
        );
    }

    function test_createAndFundRoundOnExistingHouseWithERC20s() public {
        uint256 amount = 1e18;
        address round = alice.propHouse.createAndFundRoundOnExistingHouse(
            existingHouse,
            timedRoundConfig,
            erc20Asset(amount)
        );
        assertEq(alice.erc20.balanceOf(round), amount);
    }

    function test_createAndFundRoundOnExistingHouseWithERC721() public {
        uint256 tokenId = 1;
        address round = alice.propHouse.createAndFundRoundOnExistingHouse(
            existingHouse,
            timedRoundConfig,
            erc721Asset(tokenId)
        );
        assertEq(alice.erc721.ownerOf(tokenId), round);
    }

    function test_createAndFundRoundOnExistingHouseWithERC1155() public {
        uint256 tokenId = 1;
        uint256 amount = 1e18;
        address round = alice.propHouse.createAndFundRoundOnExistingHouse(
            existingHouse,
            timedRoundConfig,
            erc1155Asset(tokenId, amount)
        );
        assertEq(alice.erc1155.balanceOf(round, tokenId), amount);
    }

    function test_createAndFundRoundOnExistingHouseWithManyAssets() public {
        uint256 tokenId = 1;
        uint256 amount = 1e18;
        address round = alice.propHouse.createAndFundRoundOnExistingHouse{ value: amount }(
            existingHouse,
            timedRoundConfig,
            allAssets(tokenId, amount)
        );
        assertEq(round.balance, amount);
        assertEq(alice.erc20.balanceOf(round), amount);
        assertEq(alice.erc721.ownerOf(tokenId), round);
        assertEq(alice.erc1155.balanceOf(round, tokenId), amount);
    }

    function test_depositToWithExactETHAmount() public {
        uint256 amount = 1e18;
        alice.propHouse.depositTo{ value: amount }(payable(existingRound), ethAsset(amount)[0]);
        assertEq(existingRound.balance, amount);
    }

    function test_depositToWithExtraETH() public {
        uint256 amount = 1e18;
        uint256 extra = 1e9;

        uint256 startingBalance = alice.addr.balance;

        alice.propHouse.depositTo{ value: amount + extra }(payable(existingRound), ethAsset(amount)[0]);
        assertEq(existingRound.balance, amount);
        assertEq(alice.addr.balance, startingBalance - amount);
    }

    function test_depositToWithETHNoValue() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INSUFFICIENT_ETHER_SUPPLIED.selector));

        uint256 amount = 1e18;
        alice.propHouse.depositTo{ value: 0 }(payable(existingRound), ethAsset(amount)[0]);
    }

    function test_depositToWithERC20s() public {
        uint256 amount = 1e18;
        alice.propHouse.depositTo(payable(existingRound), erc20Asset(amount)[0]);
        assertEq(alice.erc20.balanceOf(existingRound), amount);
    }

    function test_depositToWithERC721() public {
        uint256 tokenId = 1;
        alice.propHouse.depositTo(payable(existingRound), erc721Asset(tokenId)[0]);
        assertEq(alice.erc721.ownerOf(tokenId), existingRound);
    }

    function test_depositToWithERC1155() public {
        uint256 tokenId = 1;
        uint256 amount = 1e18;
        alice.propHouse.depositTo(payable(existingRound), erc1155Asset(tokenId, amount)[0]);
        assertEq(alice.erc1155.balanceOf(existingRound, tokenId), amount);
    }

    function test_depositToInvalidRoundReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INVALID_ROUND.selector));

        uint256 amount = 1e18;
        alice.propHouse.depositTo{ value: amount }(payable(existingHouse), ethAsset(amount)[0]);
    }

    function test_batchDepositToWithExactETHAmount() public {
        uint256 amount = 1e18;
        alice.propHouse.batchDepositTo{ value: amount }(payable(existingRound), ethAsset(amount));
        assertEq(existingRound.balance, amount);
    }

    function test_batchDepositToWithExtraETH() public {
        uint256 amount = 1e18;
        uint256 extra = 1e9;

        uint256 startingBalance = alice.addr.balance;

        alice.propHouse.batchDepositTo{ value: amount + extra }(payable(existingRound), ethAsset(amount));
        assertEq(existingRound.balance, amount);
        assertEq(alice.addr.balance, startingBalance - amount);
    }

    function test_batchDepositToWithETHNoValue() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INSUFFICIENT_ETHER_SUPPLIED.selector));

        uint256 amount = 1e18;
        alice.propHouse.batchDepositTo{ value: 0 }(payable(existingRound), ethAsset(amount));
    }

    function test_batchDepositToWithERC20s() public {
        uint256 amount = 1e18;
        alice.propHouse.batchDepositTo(payable(existingRound), erc20Asset(amount));
        assertEq(alice.erc20.balanceOf(existingRound), amount);
    }

    function test_batchDepositToWithERC721() public {
        uint256 tokenId = 1;
        alice.propHouse.batchDepositTo(payable(existingRound), erc721Asset(tokenId));
        assertEq(alice.erc721.ownerOf(tokenId), existingRound);
    }

    function test_batchDepositToWithERC1155() public {
        uint256 tokenId = 1;
        uint256 amount = 1e18;
        alice.propHouse.batchDepositTo(payable(existingRound), erc1155Asset(tokenId, amount));
        assertEq(alice.erc1155.balanceOf(existingRound, tokenId), amount);
    }

    function test_batchDepositToWithManyAssets() public {
        uint256 tokenId = 1;
        uint256 amount = 1e18;
        alice.propHouse.batchDepositTo{ value: amount }(payable(existingRound), allAssets(tokenId, amount));
        assertEq(existingRound.balance, amount);
        assertEq(alice.erc20.balanceOf(existingRound), amount);
        assertEq(alice.erc721.ownerOf(tokenId), existingRound);
        assertEq(alice.erc1155.balanceOf(existingRound, tokenId), amount);
    }

    function test_batchDepositToInvalidRoundReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INVALID_ROUND.selector));

        uint256 amount = 1e18;
        alice.propHouse.batchDepositTo{ value: amount }(payable(existingHouse), ethAsset(amount));
    }
}
