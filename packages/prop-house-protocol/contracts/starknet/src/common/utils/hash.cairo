use starknet::EthAddress;
use prop_house::common::utils::integer::as_u256;
use integer::{u128_byte_reverse, U32IntoFelt252};
use keccak::keccak_u256s_be_inputs;
use array::{ArrayTrait, SpanTrait};
use hash::LegacyHash;

/// Computes the keccak256 of multiple uint256 values.
/// The values are interpreted as big-endian.
/// The output is a big-endian uint256.
/// * `input` - The input values.
fn keccak_u256s_be(mut input: Span<u256>) -> u256 {
    let u256{low, high } = keccak_u256s_be_inputs(input);
    as_u256(u128_byte_reverse(low), u128_byte_reverse(high))
}

/// Computes the pedersen hash of an array of felts.
/// * `arr` - The array to hash.
fn compute_hash_on_elements<T, impl TLegacyHash: LegacyHash<T>, impl TCopy: Copy<T>>(
    mut arr: Span<T>
) -> felt252 {
    let mut state = 0;
    let initial_len = arr.len();
    loop {
        match arr.pop_front() {
            Option::Some(value) => {
                state = LegacyHash::hash(state, *value);
            },
            Option::None(_) => {
                break LegacyHash::hash(state, initial_len);
            }
        };
    }
}

impl LegacyHashEthAddress of LegacyHash<EthAddress> {
    fn hash(state: felt252, value: EthAddress) -> felt252 {
        LegacyHash::<felt252>::hash(state, value.address)
    }
}
