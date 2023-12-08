use starknet::EthAddress;
use prop_house::common::utils::integer::as_u256;
use keccak::keccak_u256s_be_inputs;
use integer::u128_byte_reverse;
use array::SpanTrait;
use hash::LegacyHash;

/// Computes the pedersen hash of an array of felts.
/// * `elements` - The elements to hash.
fn compute_hash_on_elements(mut elements: Span<felt252>) -> felt252 {
    let mut len = elements.len();
    let mut state = 0;
    loop {
        match elements.pop_front() {
            Option::Some(element) => {
                state = LegacyHash::hash(state, *element);
            },
            Option::None(_) => {
                break LegacyHash::hash(state, len);
            },
        };
    }
}

/// Computes the keccak256 of multiple uint256 values.
/// The values are interpreted as big-endian.
/// The output is a big-endian uint256.
/// * `input` - The input values.
fn keccak_u256s_be(mut input: Span<u256>) -> u256 {
    let u256{low, high } = keccak_u256s_be_inputs(input);
    as_u256(u128_byte_reverse(low), u128_byte_reverse(high))
}

impl LegacyHashEthAddress of LegacyHash<EthAddress> {
    fn hash(state: felt252, value: EthAddress) -> felt252 {
        LegacyHash::<felt252>::hash(state, value.address)
    }
}
