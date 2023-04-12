use array::ArrayTrait;
use traits::Into;

/// Returns the key for `mapping_key` at slot `slot_index`.
fn get_slot_key(slot_index: felt252, mapping_key: felt252) -> u256 {
    let mut encoded_array = ArrayTrait::<u256>::new();
    encoded_array.append(mapping_key.into());
    encoded_array.append(slot_index.into());

    // TODO: Return keccak256 of encoded_array (not implemented yet)
    0.into()
}
