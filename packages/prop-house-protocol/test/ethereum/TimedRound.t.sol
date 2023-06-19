// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { TestUtil } from './TestUtil.sol';
import { Asset } from '../../contracts/ethereum/lib/types/Common.sol';
import { Uint256 } from '../../contracts/ethereum/lib/utils/Uint256.sol';
import { AssetHelper } from '../../contracts/ethereum/lib/utils/AssetHelper.sol';
import { MockStarknetMessaging } from '../../contracts/ethereum/mocks/MockStarknetMessaging.sol';
import { IPropHouse } from '../../contracts/ethereum/interfaces/IPropHouse.sol';
import { IAssetRound } from '../../contracts/ethereum/interfaces/IAssetRound.sol';
import { ITimedRound } from '../../contracts/ethereum/interfaces/ITimedRound.sol';
import { TimedRound } from '../../contracts/ethereum/rounds/TimedRound.sol';

contract TimedRoundTest is TestUtil {
    address house;

    function setUp() public {
        setUpContract();
        alice = setUpUser(42, 1);
        house = alice.propHouse.createHouse(
            IPropHouse.House({ impl: communityHouseImpl, config: abi.encode('Test House URI') })
        );
    }

    function test_remainingProposalPeriodDurationTooShortReverts() public {
        vm.expectRevert(abi.encodeWithSelector(ITimedRound.REMAINING_PROPOSAL_PERIOD_DURATION_TOO_SHORT.selector));

        ITimedRound.RoundConfig memory config = validTimedRoundConfig();
        config.proposalPeriodDuration = 1;

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_votePeriodDurationTooShortReverts() public {
        vm.expectRevert(abi.encodeWithSelector(ITimedRound.VOTE_PERIOD_DURATION_TOO_SHORT.selector));

        ITimedRound.RoundConfig memory config = validTimedRoundConfig();
        config.votePeriodDuration = 1;

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_noWinnerCountReverts() public {
        vm.expectRevert(abi.encodeWithSelector(ITimedRound.WINNER_COUNT_OUT_OF_RANGE.selector));

        ITimedRound.RoundConfig memory config = validTimedRoundConfig();
        config.winnerCount = 0;

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_winnerCountTooHighReverts() public {
        vm.expectRevert(abi.encodeWithSelector(ITimedRound.WINNER_COUNT_OUT_OF_RANGE.selector));

        ITimedRound.RoundConfig memory config = validTimedRoundConfig();
        config.winnerCount = 1_000;

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_noProposingStrategiesWhenProposalThresholdSetReverts() public {
        vm.expectRevert(abi.encodeWithSelector(ITimedRound.NO_PROPOSING_STRATEGIES_PROVIDED.selector));

        ITimedRound.RoundConfig memory config = validTimedRoundConfig();
        config.proposalThreshold = 1;

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_noVotingStrategiesReverts() public {
        vm.expectRevert(abi.encodeWithSelector(ITimedRound.NO_VOTING_STRATEGIES_PROVIDED.selector));

        ITimedRound.RoundConfig memory config = validTimedRoundConfig();
        config.votingStrategies = new uint256[](0);

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_splitAwardAmountNotMultipleOfWinnerCountReverts() public {
        vm.expectRevert(abi.encodeWithSelector(ITimedRound.AWARD_AMOUNT_NOT_MULTIPLE_OF_WINNER_COUNT.selector));

        ITimedRound.RoundConfig memory config = validTimedRoundConfig();
        config.winnerCount = 10;
        config.awards = ethAsset(9999);

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_awardWinnerCountMismatchReverts() public {
        vm.expectRevert(abi.encodeWithSelector(ITimedRound.AWARD_LENGTH_MISMATCH.selector));

        ITimedRound.RoundConfig memory config = validTimedRoundConfig();
        config.winnerCount = 3;
        config.awards = allAssets(1, 1);

        alice.propHouse.createRoundOnExistingHouse(
            house,
            IPropHouse.Round({
                impl: timedRoundImpl,
                config: abi.encode(config),
                title: 'Test Round',
                description: 'Test Round Description'
            })
        );
    }

    function test_reclaimDuringActiveRoundReverts() public {
        Asset[] memory assets = erc20Asset(1e18);
        TimedRound round = TimedRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: timedRoundImpl,
                    config: abi.encode(validTimedRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );
        vm.expectRevert(abi.encodeWithSelector(ITimedRound.RECLAMATION_NOT_AVAILABLE.selector));

        vm.prank(alice.addr);
        round.reclaim(assets);
    }

    function test_reclaimToDuringActiveRoundReverts() public {
        Asset[] memory assets = erc20Asset(1e18);
        TimedRound round = TimedRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: timedRoundImpl,
                    config: abi.encode(validTimedRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );
        vm.expectRevert(abi.encodeWithSelector(ITimedRound.RECLAMATION_NOT_AVAILABLE.selector));

        vm.prank(alice.addr);
        round.reclaimTo(alice.addr, assets);
    }

    function test_reclaimWithoutDepositCreditsReverts() public {
        Asset[] memory assets = erc20Asset(1e18);
        TimedRound round = TimedRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: timedRoundImpl,
                    config: abi.encode(validTimedRoundConfig()),
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
        TimedRound round = TimedRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: timedRoundImpl,
                    config: abi.encode(validTimedRoundConfig()),
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
        TimedRound round = TimedRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: timedRoundImpl,
                    config: abi.encode(validTimedRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );
        vm.expectRevert(abi.encodeWithSelector(IAssetRound.INVALID_MERKLE_PROOF.selector));

        vm.prank(alice.addr);
        round.claim(1, 1, assets[0], new bytes32[](0));
    }

    function test_finalize() public {
        Asset[] memory assets = erc20Asset(1e18);
        TimedRound round = TimedRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: timedRoundImpl,
                    config: abi.encode(validTimedRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );

        uint256 merkleRootLow = 1;
        uint256 merkleRootHigh = 1;
        uint256[] memory payload = new uint256[](2);
        payload[0] = merkleRootLow;
        payload[1] = merkleRootHigh;

        MockStarknetMessaging(starknetCore).mockSendMessageFromL2(0, uint160(address(round)), payload);
        round.finalize(merkleRootLow, merkleRootHigh);

        assertEq(uint8(round.state()), uint8(ITimedRound.RoundState.Finalized));
        assertEq(round.finalizedAt(), block.timestamp);
        assertEq(round.winnerMerkleRoot(), bytes32((merkleRootHigh << 128) + merkleRootLow));
    }

    function test_claim() public {
        uint256 amount = 1e18;
        Asset[] memory assets = erc20Asset(amount);
        TimedRound round = TimedRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: timedRoundImpl,
                    config: abi.encode(validTimedRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );

        uint256 aliceStartingBalance = alice.erc20.balanceOf(alice.addr);
        (uint256 merkleRootLow, uint256 merkleRootHigh) = Uint256.split(
            0x7c9c69d8a59016ae9a6f44642783a573f9be79d3b290b5af6d7dbdb78c8e1086
        );

        uint256[] memory payload = new uint256[](2);
        payload[0] = merkleRootLow;
        payload[1] = merkleRootHigh;

        MockStarknetMessaging(starknetCore).mockSendMessageFromL2(0, uint160(address(round)), payload);
        round.finalize(merkleRootLow, merkleRootHigh);

        bytes32[] memory proof = new bytes32[](2);
        proof[0] = 0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761;
        proof[1] = 0x68203f90e9d07dc5859259d7536e87a6ba9d345f2552b5b9de2999ddce9ce1bf;

        uint256 proposalId = 1;
        uint256 position = 1;

        vm.prank(alice.addr);
        round.claim(proposalId, position, assets[0], proof);

        assertEq(alice.erc20.balanceOf(alice.addr), aliceStartingBalance + amount);
    }

    function test_duplicateClaimReverts() public {
        uint256 amount = 1e18;
        Asset[] memory assets = erc20Asset(amount);
        TimedRound round = TimedRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: timedRoundImpl,
                    config: abi.encode(validTimedRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );

        (uint256 merkleRootLow, uint256 merkleRootHigh) = Uint256.split(
            0x7c9c69d8a59016ae9a6f44642783a573f9be79d3b290b5af6d7dbdb78c8e1086
        );

        uint256[] memory payload = new uint256[](2);
        payload[0] = merkleRootLow;
        payload[1] = merkleRootHigh;

        uint256 proposalId = 1;
        uint256 position = 1;

        MockStarknetMessaging(starknetCore).mockSendMessageFromL2(0, uint160(address(round)), payload);
        round.finalize(merkleRootLow, merkleRootHigh);

        bytes32[] memory proof = new bytes32[](2);
        proof[0] = 0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761;
        proof[1] = 0x68203f90e9d07dc5859259d7536e87a6ba9d345f2552b5b9de2999ddce9ce1bf;

        vm.startPrank(alice.addr);
        round.claim(proposalId, position, assets[0], proof);
        vm.expectRevert(abi.encodeWithSelector(IAssetRound.ALREADY_CLAIMED.selector));
        round.claim(proposalId, position, assets[0], proof);
        vm.stopPrank();
    }

    function test_claimFromWrongCallerReverts() public {
        uint256 amount = 1e18;
        Asset[] memory assets = erc20Asset(amount);
        TimedRound round = TimedRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: timedRoundImpl,
                    config: abi.encode(validTimedRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );

        (uint256 merkleRootLow, uint256 merkleRootHigh) = Uint256.split(
            0x7c9c69d8a59016ae9a6f44642783a573f9be79d3b290b5af6d7dbdb78c8e1086
        );

        uint256[] memory payload = new uint256[](2);
        payload[0] = merkleRootLow;
        payload[1] = merkleRootHigh;

        MockStarknetMessaging(starknetCore).mockSendMessageFromL2(0, uint160(address(round)), payload);
        round.finalize(merkleRootLow, merkleRootHigh);

        bytes32[] memory proof = new bytes32[](2);
        proof[0] = 0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761;
        proof[1] = 0x68203f90e9d07dc5859259d7536e87a6ba9d345f2552b5b9de2999ddce9ce1bf;

        uint256 proposalId = 1;
        uint256 position = 1;

        vm.expectRevert(abi.encodeWithSelector(IAssetRound.INVALID_MERKLE_PROOF.selector));

        round.claim(proposalId, position, assets[0], proof);
    }

    function test_claimWithWrongAmountReverts() public {
        uint256 amount = 1e18;
        Asset[] memory assets = erc20Asset(amount);
        TimedRound round = TimedRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: timedRoundImpl,
                    config: abi.encode(validTimedRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );

        (uint256 merkleRootLow, uint256 merkleRootHigh) = Uint256.split(
            0x7c9c69d8a59016ae9a6f44642783a573f9be79d3b290b5af6d7dbdb78c8e1086
        );

        uint256[] memory payload = new uint256[](2);
        payload[0] = merkleRootLow;
        payload[1] = merkleRootHigh;

        MockStarknetMessaging(starknetCore).mockSendMessageFromL2(0, uint160(address(round)), payload);
        round.finalize(merkleRootLow, merkleRootHigh);

        bytes32[] memory proof = new bytes32[](2);
        proof[0] = 0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761;
        proof[1] = 0x68203f90e9d07dc5859259d7536e87a6ba9d345f2552b5b9de2999ddce9ce1bf;

        uint256 proposalId = 1;
        uint256 position = 1;

        vm.expectRevert(abi.encodeWithSelector(IAssetRound.INVALID_MERKLE_PROOF.selector));

        assets[0].amount = 9e18; // Set incorrect amount

        vm.prank(alice.addr);
        round.claim(proposalId, position, assets[0], proof);
    }

    function test_claimWithWrongTokenReverts() public {
        uint256 amount = 1e18;
        Asset[] memory assets = erc20Asset(amount);
        TimedRound round = TimedRound(
            alice.propHouse.createAndFundRoundOnExistingHouse(
                house,
                IPropHouse.Round({
                    impl: timedRoundImpl,
                    config: abi.encode(validTimedRoundConfig()),
                    title: 'Test Round',
                    description: 'Test Round Description'
                }),
                assets
            )
        );

        (uint256 merkleRootLow, uint256 merkleRootHigh) = Uint256.split(
            0x7c9c69d8a59016ae9a6f44642783a573f9be79d3b290b5af6d7dbdb78c8e1086
        );

        uint256[] memory payload = new uint256[](2);
        payload[0] = merkleRootLow;
        payload[1] = merkleRootHigh;

        MockStarknetMessaging(starknetCore).mockSendMessageFromL2(0, uint160(address(round)), payload);
        round.finalize(merkleRootLow, merkleRootHigh);

        bytes32[] memory proof = new bytes32[](2);
        proof[0] = 0xa8982c89d80987fb9a510e25981ee9170206be21af3c8e0eb312ef1d3382e761;
        proof[1] = 0x68203f90e9d07dc5859259d7536e87a6ba9d345f2552b5b9de2999ddce9ce1bf;

        uint256 proposalId = 1;
        uint256 position = 1;

        vm.expectRevert(abi.encodeWithSelector(IAssetRound.INVALID_MERKLE_PROOF.selector));

        assets[0].token = address(11); // Set incorrect token address

        vm.prank(alice.addr);
        round.claim(proposalId, position, assets[0], proof);
    }
}
