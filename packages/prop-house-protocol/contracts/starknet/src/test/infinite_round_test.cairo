use prop_house::common::utils::array::ArrayTraitExt;
use prop_house::rounds::infinite::round::InfiniteRound;
use prop_house::rounds::infinite::config::Proposal;
use array::{ArrayTrait, SpanTrait};
use traits::{TryInto, Into};
use option::OptionTrait;

#[test]
#[available_gas(100000000)]
fn test_infinite_round_decode_params() {
    let start_timestamp = 1686714463;
    let vote_period_duration = 7200;
    let quorum_for = 10;
    let quorum_against = 5;
    let proposal_threshold = 1;

    let mut round_params = Default::default();
    round_params.append(start_timestamp);
    round_params.append(vote_period_duration);
    round_params.append(quorum_for);
    round_params.append(quorum_against);
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

    let decoded_params = InfiniteRound::_decode_param_array(round_params.span());
    assert(decoded_params.start_timestamp.into() == *round_params.at(0), 'wrong start timestamp');
    assert(decoded_params.vote_period.into() == *round_params.at(1), 'wrong vote period');
    assert(decoded_params.quorum_for.into() == *round_params.at(2), 'wrong quorum for');
    assert(decoded_params.quorum_against.into() == *round_params.at(3), 'wrong quorum against');
    assert(decoded_params.proposal_threshold.into() == *round_params.at(4), 'wrong proposal threshold');
    assert(decoded_params.proposing_strategies.len() == 0, 'wrong proposing strategy length');
    assert(decoded_params.voting_strategies.len() == 1, 'wrong voting strategy length');
}
