use keccak::keccak_uint256s_be;
use prop_house::common::utils::u256::as_u256;

/// Reverse the byte order of a u128.
/// * `a` - The u128 to reverse.
fn reverse_u128(mut a: u128) -> u128 {
    let mut result: u128 = 0;
    let mut b = 0;

    b = a % 256;
    a /= 256;
    result = b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    a /= 256;
    result *= 256;
    result += b;

    b = a % 256;
    result *= 256;
    result += b;

    result
}

// Computes the keccak256 of multiple uint256 values.
// The values are interpreted as big-endian.
// The output is a big-endian uint256.
fn keccak_uint256s_be_to_be(mut input: Span<u256>) -> u256 {
    let u256{low, high } = keccak_uint256s_be(input);
    as_u256(reverse_u128(low), reverse_u128(high))
}
