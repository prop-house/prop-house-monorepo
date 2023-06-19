use starknet::EthAddress;
use prop_house::common::utils::integer::as_u256;
use keccak::keccak_u256s_be_inputs;
use integer::u128_byte_reverse;
use hash::LegacyHash;

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
