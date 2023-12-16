use prop_house::rounds::timed::round::TimedRound::_leading_proposal_ids::InternalContractStateTrait as LPContractStateTrait;
use prop_house::rounds::timed::round::TimedRound::_proposals::InternalContractStateTrait as PContractStateTrait;
use prop_house::rounds::timed::round::TimedRound::_proposal_count::InternalContractStateTrait as PCContractStateTrait;
use prop_house::rounds::timed::round::TimedRound::_config::InternalContractStateTrait as CContractStateTrait;
use prop_house::rounds::timed::config::{Proposal, ProposalVote, RoundConfig, RoundState};
use prop_house::common::utils::array::ArrayTraitExt;
use prop_house::rounds::timed::round::TimedRound;
use prop_house::common::utils::vec::VecTrait;
use starknet::Felt252TryIntoEthAddress;
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

    let mut round_params = array![
        award_hash,
        proposal_period_start_timestamp,
        proposal_period_duration,
        vote_period_duration,
        winner_count,
        proposal_threshold,
    ];

    // No proposing strategies
    let mut proposing_strategies = array![
        0, // Strategy addresses length
        2, // Strategy params flat length
        0,
        0,
    ];

    // 'Balance of' voting strategy
    let mut voting_strategies = array![
        1, // Strategy addresses length
        0xe37035a044375ea92895594053f4918c01f56fe5cb2c98c1399bb4c36ec17a,
        4, // Strategy params flat length
        1,
        0,
        0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03,
        4,
    ];

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
    let mut state = TimedRound::unsafe_new_contract_state();

    let mut leading_proposals = TimedRound::_get_leading_proposals(@state);
    assert(leading_proposals.index_to_pid.len() == 0, 'wrong length');

    let mut voting_powers = array![
        413158451,
        776531419, // 3 (tie-breaker)
        657398127, // 4
        539216489, // 5
        982451653, // 1
        298274213,
        776531419, // 2 (tie-breaker)
        79423867,
        474241213,
    ];
    let proposal_count = voting_powers.len();

    state._proposal_count.write(proposal_count);
    state._config.write(
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

    let mut proposal_id = 1;
    loop {
        if proposal_id == proposal_count + 1 {
            break;
        }

        let proposer_felt: felt252 = proposal_id.into();
        let proposal = Proposal {
            proposer: proposer_felt.try_into().unwrap(),
            voting_power: *voting_powers.at(proposal_id - 1),
            last_updated_at: (proposal_count - proposal_id).into(), // Earlier proposals have newer timestamps
            is_cancelled: false,
        };
        state._proposals.write(proposal_id, proposal);
        TimedRound::_insert_or_update_leading_proposal(@TimedRound::unsafe_new_contract_state(), ref leading_proposals, null(), proposal_id, proposal);

        proposal_id += 1;
    };
    state._leading_proposal_ids.write(leading_proposals.index_to_pid);

    let (mut winning_ids, _) = TimedRound::_get_winning_proposal_ids_and_data(@state);
    assert(winning_ids.len() == 5, 'incorrect length');

    // This should not be necessary, but this version of Cairo throws
    // `Failed calculating gas usage, it is likely a call for `gas::withdraw_gas` is missing.`
    // if `winning_ids` is accessed directly.
    let mut winning_proposal_ids = ArrayTrait::new();
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

#[test]
#[available_gas(100000000)]
fn test_min_heap_accurately_determines_winners_with_multiple_proposal_votes_in_separate_calls() {
    let mut state = TimedRound::unsafe_new_contract_state();

    let mut leading_proposals = TimedRound::_get_leading_proposals(@state);
    assert(leading_proposals.index_to_pid.len() == 0, 'wrong length');

    let mut voting_powers = array![
        1,
        2,
        3,
        4,
        5,
    ];
    let proposal_count = voting_powers.len();

    state._proposal_count.write(proposal_count);
    state._config.write(
        RoundConfig {
            round_state: RoundState::Active(()),
            winner_count: 3,
            proposal_period_start_timestamp: 0,
            proposal_period_end_timestamp: 0,
            vote_period_end_timestamp: 0,
            proposal_threshold: 0,
            award_hash: 0,
        }
    );

    // Create the proposals
    let mut proposal_id = 1;
    loop {
        if proposal_id == proposal_count + 1 {
            break;
        }

        // For simplicity, the proposer is the address(proposal_id).
        let proposer_felt: felt252 = proposal_id.into();
        let proposal = Proposal {
            proposer: proposer_felt.try_into().unwrap(),
            voting_power: 0,
            last_updated_at: proposal_id.into(),
            is_cancelled: false,
        };
        state._proposals.write(proposal_id, proposal);

        proposal_id += 1;
    };
    
    let mut cumulative_voting_power = 100_000_000; // Arbitrarily high

    // Cast votes
    let mut proposal_id = 1;
    loop {
        if proposal_id == proposal_count + 1 {
            break;
        }

        let voting_power = *voting_powers.at(proposal_id - 1);
        let mut proposal_votes = array![
            ProposalVote {
                proposal_id: proposal_id.into(),
                voting_power: voting_power,
            },
        ];

        let mut index = 0;
        let per_proposal_vote_submissions = 5;
        loop {
            if index == per_proposal_vote_submissions {
                break;
            }

            let mut leading_proposals = TimedRound::_get_leading_proposals(@state);
            let voter_felt: felt252 = proposal_id.into();
            TimedRound::_cast_votes_on_one_or_more_proposals(
                ref state, voter_felt.try_into().unwrap(), cumulative_voting_power, proposal_votes.span(), ref leading_proposals
            );
            state._leading_proposal_ids.write(leading_proposals.index_to_pid);

            index += 1;
        };
        proposal_id += 1;
    };

    let (mut winning_ids, _) = TimedRound::_get_winning_proposal_ids_and_data(@state);
    assert(winning_ids.len() == 3, 'incorrect length');

    // This should not be necessary, but this version of Cairo throws
    // `Failed calculating gas usage, it is likely a call for `gas::withdraw_gas` is missing.`
    // if `winning_ids` is accessed directly.
    let mut winning_proposal_ids = ArrayTrait::new();
    loop {
        match winning_ids.pop_front() {
            Option::Some(proposal_id) => winning_proposal_ids.append(*proposal_id),
            Option::None(()) => { break; },
        };
    };

    assert(*winning_proposal_ids.at(0) == 1, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(1) == 2, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(2) == 3, 'incorrect proposal id');
}

#[test]
#[available_gas(100000000000)]
fn test_min_heap_accurately_determines_max_winners_with_multiple_proposal_votes_in_separate_calls() {
    let mut state = TimedRound::unsafe_new_contract_state();

    let mut leading_proposals = TimedRound::_get_leading_proposals(@state);
    assert(leading_proposals.index_to_pid.len() == 0, 'wrong length');

    let mut voting_powers = array![
        3523544, // 1
        4234, // 2
        342342, // 3
        23424364552, // 4
        3533532, // 5
        242, // 6
        4234, // 7
        234, // 8
        2342, // 9
        34, // 10
        234, // 11
        235, // 12
        3452, // 13
        34, // 14
        21453645, // 15
        524, // 16
        31, // 17
        234, // 18
        41, // 19
        242, // 20
        46, // 21
        5234, // 22
        132, // 23
        534, // 24
        4214, // 25
        32345, // 26
        456455, // 27
        423, // 28
        1, // 29
        53, // 30
        5656, // 31
        432, // 32
        421, // 33
        3452, // 34
        345, // 35
        643, // 36
        524, // 37
        23465, // 38
        34, // 39
        65324, // 40
        12, // 41
        423, // 42
        46, // 43
        324, // 44
        2 // 45
    ];
    let proposal_count = voting_powers.len();

    state._proposal_count.write(proposal_count);
    state._config.write(
        RoundConfig {
            round_state: RoundState::Active(()),
            winner_count: 25,
            proposal_period_start_timestamp: 0,
            proposal_period_end_timestamp: 0,
            vote_period_end_timestamp: 0,
            proposal_threshold: 0,
            award_hash: 0,
        }
    );

    // Create the proposals
    let mut proposal_id = 1;
    loop {
        if proposal_id == proposal_count + 1 {
            break;
        }

        // For simplicity, the proposer is the address(proposal_id).
        let proposer_felt: felt252 = proposal_id.into();
        let proposal = Proposal {
            proposer: proposer_felt.try_into().unwrap(),
            voting_power: 0,
            last_updated_at: proposal_id.into(),
            is_cancelled: false,
        };
        state._proposals.write(proposal_id, proposal);

        proposal_id += 1;
    };
    
    let mut cumulative_voting_power = 100_000_000_000_000; // Arbitrarily high

    // Cast votes
    let mut proposal_id = 1;
    loop {
        if proposal_id == proposal_count + 1 {
            break;
        }

        let voting_power = *voting_powers.at(proposal_id - 1);
        let mut proposal_votes = array![
            ProposalVote {
                proposal_id: proposal_id.into(),
                voting_power: voting_power,
            },
        ];

        let mut index = 0;
        let per_proposal_vote_submissions = 5;
        loop {
            if index == per_proposal_vote_submissions {
                break;
            }

            let mut leading_proposals = TimedRound::_get_leading_proposals(@state);
            let voter_felt: felt252 = proposal_id.into();
            TimedRound::_cast_votes_on_one_or_more_proposals(
                ref state, voter_felt.try_into().unwrap(), cumulative_voting_power, proposal_votes.span(), ref leading_proposals
            );
            state._leading_proposal_ids.write(leading_proposals.index_to_pid);

            index += 1;
        };
        proposal_id += 1;
    };

    let (mut winning_ids, _) = TimedRound::_get_winning_proposal_ids_and_data(@state);
    assert(winning_ids.len() == 25, 'incorrect length');

    // This should not be necessary, but this version of Cairo throws
    // `Failed calculating gas usage, it is likely a call for `gas::withdraw_gas` is missing.`
    // if `winning_ids` is accessed directly.
    let mut winning_proposal_ids = ArrayTrait::new();
    loop {
        match winning_ids.pop_front() {
            Option::Some(proposal_id) => winning_proposal_ids.append(*proposal_id),
            Option::None(()) => { break; },
        };
    };

    assert(*winning_proposal_ids.at(0) == 4, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(1) == 15, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(2) == 5, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(3) == 1, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(4) == 27, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(5) == 3, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(6) == 40, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(7) == 26, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(8) == 38, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(9) == 31, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(10) == 22, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(11) == 2, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(12) == 7, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(13) == 25, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(14) == 13, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(15) == 34, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(16) == 9, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(17) == 36, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(18) == 24, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(19) == 16, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(20) == 37, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(21) == 32, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(22) == 28, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(23) == 42, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(24) == 33, 'incorrect proposal id');
}

#[test]
#[available_gas(100000000)]
fn test_min_heap_accurately_determines_winners_with_multiple_proposal_votes_in_one_call() {
    let mut state = TimedRound::unsafe_new_contract_state();

    let mut leading_proposals = TimedRound::_get_leading_proposals(@state);
    assert(leading_proposals.index_to_pid.len() == 0, 'wrong length');

    let mut voting_powers = array![0, 1, 0, 1, 0, 2, 3, 1, 3, 0, 4, 6, 0];
    let proposal_count = voting_powers.len();

    state._proposal_count.write(proposal_count);
    state._config.write(
        RoundConfig {
            round_state: RoundState::Active(()),
            winner_count: 8,
            proposal_period_start_timestamp: 0,
            proposal_period_end_timestamp: 0,
            vote_period_end_timestamp: 0,
            proposal_threshold: 0,
            award_hash: 0,
        }
    );

    let mut proposal_id = 1;
    loop {
        if proposal_id == proposal_count + 1 {
            break;
        }

        let proposer_felt: felt252 = proposal_id.into();
        let proposal = Proposal {
            proposer: proposer_felt.try_into().unwrap(),
            voting_power: 0,
            last_updated_at: proposal_id.into(), // Earlier proposals have earlier timestamps
            is_cancelled: false,
        };
        state._proposals.write(proposal_id, proposal);

        proposal_id += 1;
    };

    let mut cumulative_voting_power = 100_000_000; // Arbitrarily high

    // Cast votes
    let mut proposal_id = 1;
    loop {
        if proposal_id == proposal_count + 1 {
            break;
        }

        let voting_power = *voting_powers.at(proposal_id - 1);
        let mut proposal_votes = array![
            ProposalVote {
                proposal_id: proposal_id.into(),
                voting_power: voting_power,
            },
            ProposalVote {
                proposal_id: proposal_id.into(),
                voting_power: voting_power,
            },
            ProposalVote {
                proposal_id: proposal_id.into(),
                voting_power: voting_power,
            },
        ];

        let mut leading_proposals = TimedRound::_get_leading_proposals(@state);
        if voting_power > 0 {
            let voter_felt: felt252 = proposal_id.into();
            TimedRound::_cast_votes_on_one_or_more_proposals(
                ref state, voter_felt.try_into().unwrap(), cumulative_voting_power, proposal_votes.span(), ref leading_proposals
            );
        }
        state._leading_proposal_ids.write(leading_proposals.index_to_pid);

        proposal_id += 1;
    };

    let (mut winning_ids, _) = TimedRound::_get_winning_proposal_ids_and_data(@state);
    assert(winning_ids.len() == 8, 'incorrect length');

    // This should not be necessary, but this version of Cairo throws
    // `Failed calculating gas usage, it is likely a call for `gas::withdraw_gas` is missing.`
    // if `winning_ids` is accessed directly.
    let mut winning_proposal_ids = ArrayTrait::new();
    loop {
        match winning_ids.pop_front() {
            Option::Some(proposal_id) => winning_proposal_ids.append(*proposal_id),
            Option::None(()) => { break; },
        };
    };

    assert(*winning_proposal_ids.at(0) == 12, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(1) == 11, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(2) == 7, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(3) == 9, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(4) == 6, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(5) == 2, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(6) == 4, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(7) == 8, 'incorrect proposal id');
}

#[test]
#[available_gas(100000000)]
fn test_min_heap_accurately_determines_winners_when_packing_multiple_slots() {
    let mut state = TimedRound::unsafe_new_contract_state();

    let mut leading_proposals = TimedRound::_get_leading_proposals(@state);
    assert(leading_proposals.index_to_pid.len() == 0, 'wrong length');

    let mut voting_powers = array![
        413158451,
        776531419, // 3 (tie-breaker)
        657398127, // 4
        539216489, // 5
        982451653, // 1
        298274213,
        776531419, // 2 (tie-breaker)
        79423867,
        474241213,
    ];
    let proposal_count = voting_powers.len();

    state._proposal_count.write(proposal_count);
    state._config.write(
        RoundConfig {
            round_state: RoundState::Active(()),
            winner_count: 8,
            proposal_period_start_timestamp: 0,
            proposal_period_end_timestamp: 0,
            vote_period_end_timestamp: 0,
            proposal_threshold: 0,
            award_hash: 0,
        }
    );

    let mut proposal_id = 1;
    loop {
        if proposal_id == proposal_count + 1 {
            break;
        }

        let proposer_felt: felt252 = proposal_id.into();
        let proposal = Proposal {
            proposer: proposer_felt.try_into().unwrap(),
            voting_power: *voting_powers.at(proposal_id - 1),
            last_updated_at: (proposal_count - proposal_id).into(), // Earlier proposals have newer timestamps
            is_cancelled: false,
        };
        state._proposals.write(proposal_id, proposal);
        TimedRound::_insert_or_update_leading_proposal(@TimedRound::unsafe_new_contract_state(), ref leading_proposals, null(), proposal_id, proposal);

        proposal_id += 1;
    };
    state._leading_proposal_ids.write(leading_proposals.index_to_pid);

    let (mut winning_ids, _) = TimedRound::_get_winning_proposal_ids_and_data(@state);
    assert(winning_ids.len() == 8, 'incorrect length');

    // This should not be necessary, but this version of Cairo throws
    // `Failed calculating gas usage, it is likely a call for `gas::withdraw_gas` is missing.`
    // if `winning_ids` is accessed directly.
    let mut winning_proposal_ids = ArrayTrait::new();
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
    assert(*winning_proposal_ids.at(5) == 9, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(6) == 1, 'incorrect proposal id');
    assert(*winning_proposal_ids.at(7) == 6, 'incorrect proposal id');
}
