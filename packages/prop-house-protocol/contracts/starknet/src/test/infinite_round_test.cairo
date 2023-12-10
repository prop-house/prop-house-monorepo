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

    let mut round_params = array![
        start_timestamp,
        vote_period_duration,
        quorum_for,
        quorum_against,
        proposal_threshold
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
    let mut imt_1 = IncrementalMerkleTreeTrait::new(10, 0, Default::default());
    imt_1.append_leaf(0x73e3c177fdb67a69d76ec8dab4f62d709926319f0510997524b68b7b9e18b70);
    imt_1.append_leaf(0xd2835bd54e740a2cd6ebb220e40f5cefac5f97471dbdd6fa0621437dc283c835);
    imt_1.append_leaf(0x1b184a486864ab1ff4a922b8c0c0da838a795daa6292991d9c5d4a5131f3aae1);
    imt_1.append_leaf(0xdd03063dc9d88ba854fe3eeb08e905c81550c7d5a3dbe2fcffed7b2759952fb7);
    imt_1.append_leaf(0x62846b0eacbddbb2e3fa5c724fbf316c77c27bd747ac954b716695aa4d6b8465);
    imt_1.append_leaf(0xc84e0ff775aa1709224368de0f86c9be566f0625ea2daa4f39c78ce533f030d6);
    imt_1.append_leaf(0xf40e763c4a8b86557eb0b5110f9a20c09a142a2c72e659a0572b459b88dc3972);

    let max_used_depth = imt_1.get_current_depth();
    assert(max_used_depth == 3, 'wrong max used depth');

    let mut state = InfiniteRound::unsafe_new_contract_state();
    InfiniteRound::_write_sub_trees_to_storage(ref state, max_used_depth, ref imt_1.sub_trees);

    let mut imt_2 = IncrementalMerkleTreeTrait::new(10, 1, InfiniteRound::_read_sub_trees_from_storage(@state));

    let mut curr_depth = 0;
    loop {
        if curr_depth == max_used_depth.into() {
            break;
        }
        let imt_1_sub_tree = imt_1.sub_trees.get(curr_depth).deref();
        let imt_2_sub_tree = imt_2.sub_trees.get(curr_depth).deref();

        assert(*imt_1_sub_tree.at(0) == *imt_2_sub_tree.at(0), 'wrong sub tree value at index 0');
        assert(*imt_1_sub_tree.at(1) == *imt_2_sub_tree.at(1), 'wrong sub tree value at index 1');

        curr_depth += 1;
    };
}
