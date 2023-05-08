use prop_house::common::utils::u256::as_u256;
use keccak::keccak_uint256s_be;
use integer::u128_byte_reverse;

// Computes the keccak256 of multiple uint256 values.
// The values are interpreted as big-endian.
// The output is a big-endian uint256.
fn keccak_uint256s_be_to_be(mut input: Span<u256>) -> u256 {
    let u256{low, high } = keccak_uint256s_be(input);
    as_u256(u128_byte_reverse(low), u128_byte_reverse(high))
}
