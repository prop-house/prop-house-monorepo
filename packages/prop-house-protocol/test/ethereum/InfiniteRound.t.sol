// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { TestUtil } from './TestUtil.sol';
import { Asset } from '../../contracts/ethereum/lib/types/Common.sol';
import { IPropHouse } from '../../contracts/ethereum/interfaces/IPropHouse.sol';
import { IInfiniteRound } from '../../contracts/ethereum/interfaces/IInfiniteRound.sol';

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
}
