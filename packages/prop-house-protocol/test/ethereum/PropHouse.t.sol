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
    
    function setUp() public {
        setUpContract();
        alice = setUpUser(42, 1);

        existingHouse = alice.propHouse.createHouse(
            IPropHouse.House({
                impl: communityHouseImpl,
                config: abi.encode('Test House URI')
            })
        );
    }

    function test_createRoundOnNewHouse() public {
        (address house, address round) = alice.propHouse.createRoundOnNewHouse(
            IPropHouse.House({
                impl: communityHouseImpl,
                config: abi.encode('Test House URI')
            }),
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
        assertNotEq(house, address(0));
        assertNotEq(round, address(0));
    }

    function test_createRoundOnNewHouseUnregisteredHouseReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INVALID_HOUSE_IMPL.selector));
        alice.propHouse.createRoundOnNewHouse(
            IPropHouse.House({
                impl: address(111),
                config: abi.encode('Test House URI')
            }),
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_createRoundOnNewHouseUnregisteredRoundReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INVALID_ROUND_IMPL_FOR_HOUSE.selector));
        alice.propHouse.createRoundOnNewHouse(
            IPropHouse.House({
                impl: communityHouseImpl,
                config: abi.encode('Test House URI')
            }),
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
            IPropHouse.House({
                impl: wrongHouseImpl,
                config: abi.encode('Test House URI')
            }),
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_createAndFundRoundOnNewHouseWithExactETHAmount() public {
        uint256 amount = 1e18;

        Asset[] memory assets = new Asset[](1);
        assets[0] = Asset({
            assetType: AssetType.Native,
            token: address(0),
            identifier: 0,
            amount: amount
        });
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse{ value: amount }(
            IPropHouse.House({
                impl: communityHouseImpl,
                config: abi.encode('Test House URI')
            }),
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            }),
            assets
        );
        assertEq(round.balance, amount);
    }

    function test_createAndFundRoundOnNewHouseWithExtraETH() public {
        uint256 amount = 1e18;
        uint256 extra = 1e9;

        Asset[] memory assets = new Asset[](1);
        assets[0] = Asset({
            assetType: AssetType.Native,
            token: address(0),
            identifier: 0,
            amount: amount
        });
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse{ value: amount + extra }(
            IPropHouse.House({
                impl: communityHouseImpl,
                config: abi.encode('Test House URI')
            }),
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            }),
            assets
        );
        assertEq(round.balance, amount);
        assertEq(starknetCore.balance, extra); // Starknet Core uses excess ETH for L1 -> L2 message
    }

    function test_createAndFundRoundOnNewHouseWithETHNoValue() public {
        uint256 amount = 1e18;

        vm.expectRevert(abi.encodeWithSelector(AssetController.ETHER_TRANSFER_FAILED.selector));

        Asset[] memory assets = new Asset[](1);
        assets[0] = Asset({
            assetType: AssetType.Native,
            token: address(0),
            identifier: 0,
            amount: amount
        });
        alice.propHouse.createAndFundRoundOnNewHouse{ value: 0 }(
            IPropHouse.House({
                impl: communityHouseImpl,
                config: abi.encode('Test House URI')
            }),
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            }),
            assets
        );
    }

    function test_createAndFundRoundOnNewHouseWithERC20s() public {
        uint256 amount = 1e18;

        Asset[] memory assets = new Asset[](1);
        assets[0] = Asset({
            assetType: AssetType.ERC20,
            token: erc20,
            identifier: 0,
            amount: amount
        });
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse(
            IPropHouse.House({
                impl: communityHouseImpl,
                config: abi.encode('Test House URI')
            }),
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            }),
            assets
        );
        assertEq(alice.erc20.balanceOf(round), amount);
    }

    function test_createAndFundRoundOnNewHouseWithERC721() public {
        uint256 tokenId = 1;

        Asset[] memory assets = new Asset[](1);
        assets[0] = Asset({
            assetType: AssetType.ERC721,
            token: erc721,
            identifier: tokenId,
            amount: 1
        });
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse(
            IPropHouse.House({
                impl: communityHouseImpl,
                config: abi.encode('Test House URI')
            }),
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            }),
            assets
        );
        assertEq(alice.erc721.ownerOf(tokenId), round);
    }

    function test_createAndFundRoundOnNewHouseWithERC1155() public {
        uint256 tokenId = 1;
        uint256 amount = 1e18;

        Asset[] memory assets = new Asset[](1);
        assets[0] = Asset({
            assetType: AssetType.ERC1155,
            token: erc1155,
            identifier: tokenId,
            amount: amount
        });
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse(
            IPropHouse.House({
                impl: communityHouseImpl,
                config: abi.encode('Test House URI')
            }),
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            }),
            assets
        );
        assertEq(alice.erc1155.balanceOf(round, tokenId), amount);
    }

    function test_createAndFundRoundOnNewHouseWithManyAssets() public {
        uint256 tokenId = 1;
        uint256 amount = 1e18;

        Asset[] memory assets = new Asset[](4);
        assets[0] = Asset({
            assetType: AssetType.Native,
            token: address(0),
            identifier: 0,
            amount: amount
        });
        assets[1] = Asset({
            assetType: AssetType.ERC20,
            token: erc20,
            identifier: 0,
            amount: amount
        });
        assets[2] = Asset({
            assetType: AssetType.ERC721,
            token: erc721,
            identifier: tokenId,
            amount: 1
        });
        assets[3] = Asset({
            assetType: AssetType.ERC1155,
            token: erc1155,
            identifier: tokenId,
            amount: amount
        });
        (, address round) = alice.propHouse.createAndFundRoundOnNewHouse{ value: amount }(
            IPropHouse.House({
                impl: communityHouseImpl,
                config: abi.encode('Test House URI')
            }),
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            }),
            assets
        );
        assertEq(round.balance, amount);
        assertEq(alice.erc20.balanceOf(round), amount);
        assertEq(alice.erc721.ownerOf(tokenId), round);
        assertEq(alice.erc1155.balanceOf(round, tokenId), amount);
    }

    function test_createRoundOnExistingHouse() public {
        address round = alice.propHouse.createRoundOnExistingHouse(
            existingHouse,
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
        assertNotEq(round, address(0));
    }

    function test_createRoundOnExistingHouseNonExistentHouseReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IPropHouse.INVALID_HOUSE.selector));
        alice.propHouse.createRoundOnExistingHouse(
            address(111),
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(validTimedRoundConfig()),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
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
}
