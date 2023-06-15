use prop_house::common::utils::array::ArrayTraitExt;
use prop_house::rounds::timed::round::TimedRound;
use option::OptionTrait;
use array::ArrayTrait;
use traits::TryInto;

#[test]
#[available_gas(100000000)]
fn timed_round_config_init_test() {
    let award_hash = 0x311d393f323bcfd84ef7611293f67f824ce50108ed05c2e9b112064a7910420;
    let proposal_period_start_timestamp = 1686714463;
    let proposal_period_duration = 14400;
    let vote_period_duration = 7200;
    let winner_count = 5;
    let proposal_threshold = 1;

    let proposal_period_end_timestamp = proposal_period_start_timestamp + proposal_period_duration;
    let vote_period_end_timestamp = proposal_period_end_timestamp + vote_period_duration;

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

    TimedRound::initializer(round_params.span());

    let config = TimedRound::_config::read();

    assert(config.award_hash == *round_params.at(0), 'wrong award hash');
    assert(
        config.proposal_period_start_timestamp == (*round_params.at(1)).try_into().unwrap(),
        'wrong start timestamp'
    );
    assert(
        config.proposal_period_end_timestamp == proposal_period_end_timestamp.try_into().unwrap(),
        'wrong end timestamp'
    );
    assert(
        config.vote_period_end_timestamp == vote_period_end_timestamp.try_into().unwrap(),
        'wrong vote period end timestamp'
    );
    assert(config.winner_count == (*round_params.at(4)).try_into().unwrap(), 'wrong winner count');
    assert(config.proposal_threshold == *round_params.at(5), 'wrong proposal threshold');
}
