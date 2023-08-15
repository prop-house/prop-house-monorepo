use starknet::Felt252TryIntoEthAddress;
use prop_house::rounds::timed::config::{Proposal, RoundConfig, RoundState};
use prop_house::common::utils::array::ArrayTraitExt;
use prop_house::rounds::timed::round::TimedRound;
use prop_house::common::utils::vec::VecTrait;
use array::{ArrayTrait, SpanTrait};
use integer::u256_from_felt252;
use traits::{Into, TryInto};
use option::OptionTrait;
use nullable::null;

#[test]
#[available_gas(100000000)]
fn test_timed_round_decode_params() {
    let award_hash = 0x311d393f323bcfd84ef7611293f67f824ce50108ed05c2e9b112064a7910420;
    let proposal_period_start_timestamp = 1686714463;
    let proposal_period_duration = 14400;
    let vote_period_duration = 7200;
    let winner_count = 5;
    let proposal_threshold = 1;

    let mut round_params = Default::default();
    round_params.append(award_hash);
    round_params.append(proposal_period_start_timestamp);
    round_params.append(proposal_period_duration);
    round_params.append(vote_period_duration);
    round_params.append(winner_count);
    round_params.append(proposal_threshold);

    // No proposing strategies
    let mut proposing_strategies = Default::default();
    proposing_strategies.append(0); // Strategy addresses length
    proposing_strategies.append(2); // Strategy params flat length
    proposing_strategies.append(0);
    proposing_strategies.append(0);

    // 'Balance of' voting strategy
    let mut voting_strategies = Default::default();
    voting_strategies.append(1); // Strategy addresses length
    voting_strategies.append(0xe37035a044375ea92895594053f4918c01f56fe5cb2c98c1399bb4c36ec17a);
    voting_strategies.append(4); // Strategy params flat length
    voting_strategies.append(1);
    voting_strategies.append(0);
    voting_strategies.append(0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03);
    voting_strategies.append(4);

    round_params.append_all(proposing_strategies.span());
    round_params.append_all(voting_strategies.span());

    let decoded_params = TimedRound::_decode_param_array(round_params.span());
    assert(decoded_params.award_hash == *round_params.at(0), 'wrong award hash');
    assert(
        decoded_params.proposal_period_start_timestamp == (*round_params.at(1)).try_into().unwrap(),
        'wrong start timestamp'
    );
    assert(
        decoded_params.proposal_period_duration == (*round_params.at(2)).try_into().unwrap(),
        'wrong end timestamp'
    );
    assert(
        decoded_params.vote_period_duration == (*round_params.at(3)).try_into().unwrap(),
        'wrong vote period end timestamp'
    );
    assert(
        decoded_params.winner_count == (*round_params.at(4)).try_into().unwrap(),
        'wrong winner count'
    );
    assert(decoded_params.proposal_threshold == *round_params.at(5), 'wrong proposal threshold');
    assert(decoded_params.proposing_strategies.len() == 0, 'wrong proposing strategy length');
    assert(decoded_params.voting_strategies.len() == 1, 'wrong voting strategy length');
}

#[test]
#[available_gas(100000000)]
fn test_min_heap_accurately_determines_winners() {
    let mut leading_proposals = TimedRound::_get_leading_proposals();
    assert(leading_proposals.index_to_pid.len() == 0, 'wrong length');

    let mut voting_powers = Default::default();
    voting_powers.append(413158451);
    voting_powers.append(776531419); // 3 (tie-breaker)
    voting_powers.append(657398127); // 4
    voting_powers.append(539216489); // 5
    voting_powers.append(982451653); // 1
    voting_powers.append(298274213);
    voting_powers.append(776531419); // 2 (tie-breaker)
    voting_powers.append(79423867);
    voting_powers.append(474241213);

    TimedRound::_proposal_count::write(10);
    TimedRound::_config::write(
        RoundConfig {
            round_state: RoundState::Active(()),
            winner_count: 5,
            proposal_period_start_timestamp: 0,
            proposal_period_end_timestamp: 0,
            vote_period_end_timestamp: 0,
            proposal_threshold: 0,
            award_hash: 0,
        }
    );

    let count: u32 = 10;
    let mut proposal_id = 1;
    loop {
        if proposal_id == count {
            break;
        }

        let proposer_felt: felt252 = proposal_id.into();
        let proposal = Proposal {
            proposer: proposer_felt.try_into().unwrap(),
            voting_power: *voting_powers.at(proposal_id - 1),
            last_updated_at: (count - proposal_id).into(), // Earlier proposals have higher timestamps
            is_cancelled: false,
        };
        TimedRound::_proposals::write(proposal_id, proposal);
        TimedRound::_insert_or_update_leading_proposal(ref leading_proposals, null(), proposal_id, proposal);

        proposal_id += 1;
    };
    TimedRound::_leading_proposal_ids::write(leading_proposals.index_to_pid);

    let (mut winning_ids, _) = TimedRound::_get_winning_proposal_ids_and_data();
    assert(winning_ids.len() == 5, 'incorrect length');

    // This should not be necessary, but this version of Cairo throws
    // `Failed calculating gas usage, it is likely a call for `gas::withdraw_gas` is missing.`
    // if `winning_ids` is accessed directly.
    let mut winning_proposal_ids = Default::default();
    loop {
        match winning_ids.pop_front() {
            Option::Some(proposal_id) => winning_proposal_ids.append(*proposal_id),
            Option::None(()) => { break; },
        };
    };

    assert(*winning_proposal_ids.at(0) == 5, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(1) == 7, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(2) == 2, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(3) == 3, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(4) == 4, 'incorrect proposal id');
}
