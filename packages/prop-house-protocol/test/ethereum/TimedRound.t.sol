// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.17;

import { TestUtil } from './TestUtil.sol';
import { Asset } from '../../contracts/ethereum/lib/types/Common.sol';
import { IPropHouse } from '../../contracts/ethereum/interfaces/IPropHouse.sol';
import { ITimedRound } from '../../contracts/ethereum/interfaces/ITimedRound.sol';

contract TimedRoundTest is TestUtil {
    address house;

    function setUp() public {
        setUpContract();
        alice = setUpUser(42, 1);
        house = alice.propHouse.createHouse(
            IPropHouse.House({
              impl: communityHouseImpl,
              config: abi.encode('Test House URI')
            })
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
}
