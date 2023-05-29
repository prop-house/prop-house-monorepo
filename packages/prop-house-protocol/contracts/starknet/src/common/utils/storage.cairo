use prop_house::common::utils::hash::keccak_u256s_be;
use array::ArrayTrait;
use traits::Into;

/// Returns the key for `mapping_key` at slot `slot_index`.
fn get_slot_key(slot_index: felt252, mapping_key: felt252) -> u256 {
    let mut encoded_array = Default::default();
    encoded_array.append(mapping_key.into());
    encoded_array.append(slot_index.into());

    keccak_u256s_be(encoded_array.span())
}
