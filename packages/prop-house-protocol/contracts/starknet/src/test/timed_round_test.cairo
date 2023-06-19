use starknet::{get_block_timestamp, Felt252TryIntoEthAddress};
use prop_house::common::utils::array::ArrayTraitExt;
use prop_house::rounds::timed::config::{Proposal, ProposalWithId};
use prop_house::rounds::timed::round::TimedRound;
use array::{ArrayTrait, SpanTrait};
use integer::u256_from_felt252;
use traits::{Into, TryInto};
use option::OptionTrait;

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
fn test_timed_round_get_n_proposals_by_voting_power_desc() {
    let mut proposals = Default::default();

    let count: u32 = 200;
    let mut i = 1;
    loop {
        if i == count {
            break;
        }
        let proposer_felt: felt252 = i.into();
        proposals.append(
            ProposalWithId {
                proposal_id: i,
                proposal: Proposal {
                    proposer: proposer_felt.try_into().unwrap(),
                    last_updated_at: get_block_timestamp(),
                    is_cancelled: false,
                    voting_power: u256_from_felt252(i.into()),
                },
            },
        );
        i += 1;
    };

    let sorted_proposals = TimedRound::_get_n_proposals_by_voting_power_desc(proposals, 10);
    assert(sorted_proposals.len() == 10, 'wrong length');

    let mut i = 0;
    loop {
        if i == 10 {
            break;
        }
        assert((*sorted_proposals.at(i)).proposal_id == count - i - 1, 'wrong proposal id');
        i += 1;
    };
}
