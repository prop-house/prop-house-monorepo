// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { TestUtil } from './TestUtil.sol';
import { Asset, IncrementalTreeProof } from '../../contracts/ethereum/lib/types/Common.sol';
import { Uint256 } from '../../contracts/ethereum/lib/utils/Uint256.sol';
import { AssetHelper } from '../../contracts/ethereum/lib/utils/AssetHelper.sol';
import { MockStarknetMessaging } from '../../contracts/ethereum/mocks/MockStarknetMessaging.sol';
import { IPropHouse } from '../../contracts/ethereum/interfaces/IPropHouse.sol';
import { IInfiniteRound } from '../../contracts/ethereum/interfaces/IInfiniteRound.sol';
import { IAssetRound } from '../../contracts/ethereum/interfaces/IAssetRound.sol';
import { InfiniteRound } from '../../contracts/ethereum/rounds/InfiniteRound.sol';

contract InfiniteRoundTest is TestUtil {
    address house;

    function setUp() public {
        setUpContract();
        alice = setUpUser(42, 1);
        house = alice.propHouse.createHouse(
            IPropHouse.House({ impl: communityHouseImpl, config: abi.encode('Test House URI') })
        );
    }

    function test_votePeriodDurationTooShortReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IInfiniteRound.VOTE_PERIOD_DURATION_TOO_SHORT.selector));

        IInfiniteRound.RoundConfig memory config = validInfiniteRoundConfig();
        config.votePeriodDuration = 1;

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: infiniteRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_noForQuorumReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IInfiniteRound.NO_FOR_QUORUM_PROVIDED.selector));

        IInfiniteRound.RoundConfig memory config = validInfiniteRoundConfig();
        config.quorumFor = 0;

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: infiniteRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_noAgainstQuorumReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IInfiniteRound.NO_AGAINST_QUORUM_PROVIDED.selector));

        IInfiniteRound.RoundConfig memory config = validInfiniteRoundConfig();
        config.quorumAgainst = 0;

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: infiniteRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_noProposingStrategiesWhenProposalThresholdSetReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IInfiniteRound.NO_PROPOSING_STRATEGIES_PROVIDED.selector));

        IInfiniteRound.RoundConfig memory config = validInfiniteRoundConfig();
        config.proposalThreshold = 1;

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: infiniteRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_noVotingStrategiesReverts() public {
        vm.expectRevert(abi.encodeWithSelector(IInfiniteRound.NO_VOTING_STRATEGIES_PROVIDED.selector));

        IInfiniteRound.RoundConfig memory config = validInfiniteRoundConfig();
        config.votingStrategies = new uint256[](0);

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: infiniteRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_reclaimDuringActiveRoundReverts() public {
        Asset[] memory assets = erc20Asset(1e18);
        InfiniteRound round = InfiniteRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: infiniteRoundImpl,
                    config: abi.encode(validInfiniteRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );
        vm.expectRevert(abi.encodeWithSelector(IInfiniteRound.RECLAMATION_NOT_AVAILABLE.selector));

        vm.prank(alice.addr);
        round.reclaim(assets);
    }

    function test_reclaimToDuringActiveRoundReverts() public {
        Asset[] memory assets = erc20Asset(1e18);
        InfiniteRound round = InfiniteRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: infiniteRoundImpl,
                    config: abi.encode(validInfiniteRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );
        vm.expectRevert(abi.encodeWithSelector(IInfiniteRound.RECLAMATION_NOT_AVAILABLE.selector));

        vm.prank(alice.addr);
        round.reclaimTo(alice.addr, assets);
    }

    function test_reclaimWithoutDepositCreditsReverts() public {
        Asset[] memory assets = erc20Asset(1e18);
        InfiniteRound round = InfiniteRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: infiniteRoundImpl,
                    config: abi.encode(validInfiniteRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );
        vm.prank(alice.addr);
        round.cancel();

        vm.expectRevert();
        round.reclaim(assets);
    }

    function test_reclaimSucceedsOnCancel() public {
        uint256 amount = 1e18;
        uint256 aliceStartingBalance = alice.erc20.balanceOf(alice.addr);

        Asset[] memory assets = erc20Asset(amount);
        InfiniteRound round = InfiniteRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: infiniteRoundImpl,
                    config: abi.encode(validInfiniteRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );
        assertEq(alice.erc20.balanceOf(alice.addr), aliceStartingBalance - amount);

        vm.startPrank(alice.addr);
        round.cancel();
        round.reclaim(assets);
        vm.stopPrank();

        assertEq(alice.erc20.balanceOf(alice.addr), aliceStartingBalance);
    }

    function test_claimWithoutRootReverts() public {
        Asset[] memory assets = erc20Asset(1e18);
        InfiniteRound round = InfiniteRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: infiniteRoundImpl,
                    config: abi.encode(validInfiniteRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );
        vm.expectRevert(abi.encodeWithSelector(IAssetRound.INVALID_MERKLE_PROOF.selector));

        vm.prank(alice.addr);
        round.claim(1, assets, IncrementalTreeProof({ siblings: new bytes32[](0), pathIndices: new uint8[](0) }));
    }

    function test_claim() public {
        uint256 amount = 1e18;
        Asset[] memory assets = erc20Asset(amount);
        InfiniteRound round = InfiniteRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: infiniteRoundImpl,
                    config: abi.encode(validInfiniteRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );

        uint256 aliceStartingBalance = alice.erc20.balanceOf(alice.addr);
        (uint256 merkleRootLow, uint256 merkleRootHigh) = Uint256.split(
            0xf7aa7dd32e60d826f31b8e84c5582614a034d1a8f77f55ad261e5a5b5113ccaf
        );

        uint256[] memory payload = new uint256[](3);
        payload[0] = 1; // winner count
        payload[1] = merkleRootLow;
        payload[2] = merkleRootHigh;

        MockStarknetMessaging(starknetCore).mockSendMessageFromL2(0, uint160(address(round)), payload);
        round.updateWinners(1, merkleRootLow, merkleRootHigh);

        bytes32[] memory siblings = new bytes32[](10);
        siblings[0] = bytes32(0);
        siblings[1] = 0xad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5;
        siblings[2] = 0x4261e07b08324f069aef36043a610b6e07b963a5e45589f2f6fd59e4bc23948b;
        siblings[3] = 0x21ddb9a356815c3fac1026b6dec5df3124afbadb485c9ba5a3e3398a04b7ba85;
        siblings[4] = 0xe58769b32a1beaf1ea27375a44095a0d1fb664ce2dd358e7fcbfb78c26a19344;
        siblings[5] = 0x0eb01ebfc9ed27500cd4dfc979272d1f0913cc9f66540d7e8005811109e1cf2d;
        siblings[6] = 0x887c22bd8750d34016ac3c66b5ff102dacdd73f6b014e710b51e8022af9a1968;
        siblings[7] = 0xffd70157e48063fc33c97a050f7f640233bf646cc98d9524c6b92bcf3ab56f83;
        siblings[8] = 0x9867cc5f7f196b93bae1e27e6320742445d290f2263827498b54fec539f756af;
        siblings[9] = 0xcefad4e508c098b9a7e1d8feb19955fb02ba9675585078710969d3440f5054e0;

        uint8[] memory pathIndices = new uint8[](10);
        pathIndices[0] = 0;
        pathIndices[1] = 0;
        pathIndices[2] = 1;
        pathIndices[3] = 0;
        pathIndices[4] = 0;
        pathIndices[5] = 0;
        pathIndices[6] = 0;
        pathIndices[7] = 0;
        pathIndices[8] = 0;
        pathIndices[9] = 0;

        IncrementalTreeProof memory proof = IncrementalTreeProof({ siblings: siblings, pathIndices: pathIndices });

        vm.prank(alice.addr);
        round.claim(1, assets, proof);

        assertEq(alice.erc20.balanceOf(alice.addr), aliceStartingBalance + amount);
    }

    function test_duplicateClaimReverts() public {
        uint256 amount = 1e18;
        Asset[] memory assets = erc20Asset(amount);
        InfiniteRound round = InfiniteRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: infiniteRoundImpl,
                    config: abi.encode(validInfiniteRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );
        (uint256 merkleRootLow, uint256 merkleRootHigh) = Uint256.split(
            0xf7aa7dd32e60d826f31b8e84c5582614a034d1a8f77f55ad261e5a5b5113ccaf
        );

        uint256[] memory payload = new uint256[](3);
        payload[0] = 1; // winner count
        payload[1] = merkleRootLow;
        payload[2] = merkleRootHigh;

        MockStarknetMessaging(starknetCore).mockSendMessageFromL2(0, uint160(address(round)), payload);
        round.updateWinners(1, merkleRootLow, merkleRootHigh);

        bytes32[] memory siblings = new bytes32[](10);
        siblings[0] = bytes32(0);
        siblings[1] = 0xad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5;
        siblings[2] = 0x4261e07b08324f069aef36043a610b6e07b963a5e45589f2f6fd59e4bc23948b;
        siblings[3] = 0x21ddb9a356815c3fac1026b6dec5df3124afbadb485c9ba5a3e3398a04b7ba85;
        siblings[4] = 0xe58769b32a1beaf1ea27375a44095a0d1fb664ce2dd358e7fcbfb78c26a19344;
        siblings[5] = 0x0eb01ebfc9ed27500cd4dfc979272d1f0913cc9f66540d7e8005811109e1cf2d;
        siblings[6] = 0x887c22bd8750d34016ac3c66b5ff102dacdd73f6b014e710b51e8022af9a1968;
        siblings[7] = 0xffd70157e48063fc33c97a050f7f640233bf646cc98d9524c6b92bcf3ab56f83;
        siblings[8] = 0x9867cc5f7f196b93bae1e27e6320742445d290f2263827498b54fec539f756af;
        siblings[9] = 0xcefad4e508c098b9a7e1d8feb19955fb02ba9675585078710969d3440f5054e0;

        uint8[] memory pathIndices = new uint8[](10);
        pathIndices[0] = 0;
        pathIndices[1] = 0;
        pathIndices[2] = 1;
        pathIndices[3] = 0;
        pathIndices[4] = 0;
        pathIndices[5] = 0;
        pathIndices[6] = 0;
        pathIndices[7] = 0;
        pathIndices[8] = 0;
        pathIndices[9] = 0;

        IncrementalTreeProof memory proof = IncrementalTreeProof({ siblings: siblings, pathIndices: pathIndices });

        vm.startPrank(alice.addr);
        round.claim(1, assets, proof);
        vm.expectRevert(abi.encodeWithSelector(IAssetRound.ALREADY_CLAIMED.selector));
        round.claim(1, assets, proof);
        vm.stopPrank();
    }
}
