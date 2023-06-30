use prop_house::common::utils::merkle::IncrementalMerkleTreeTrait;
use prop_house::common::utils::array::ArrayTraitExt;
use prop_house::rounds::infinite::round::InfiniteRound;
use array::{ArrayTrait, SpanTrait};
use traits::{TryInto, Into};
use nullable::NullableTrait;
use dict::Felt252DictTrait;
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

#[test]
#[available_gas(100000000)]
fn test_infinite_round_sub_tree_storage() {
    let mut imt_1 = IncrementalMerkleTreeTrait::<u256>::new(
        10, 0, Default::default(),
    );
    imt_1.append_leaf(
        0x73e3c177fdb67a69d76ec8dab4f62d709926319f0510997524b68b7b9e18b70_u256
    );
    InfiniteRound::_write_sub_trees_to_storage(ref imt_1.sub_trees);

    let mut imt_2 = IncrementalMerkleTreeTrait::<u256>::new(
        10, 1, InfiniteRound::_read_sub_trees_from_storage(),
    );

    let mut curr_depth = 0;
    loop {
        if curr_depth == 10 {
            break;
        }
        let imt_1_sub_tree = imt_1.sub_trees.get(curr_depth).deref();
        let imt_2_sub_tree = imt_2.sub_trees.get(curr_depth).deref();

        assert(*imt_1_sub_tree.at(0) == *imt_2_sub_tree.at(0), 'wrong sub tree value at index 0');
        assert(*imt_1_sub_tree.at(1) == *imt_2_sub_tree.at(1), 'wrong sub tree value at index 1');

        curr_depth += 1;
    };
}
