use prop_house::common::utils::array::Felt252SpanIntoU256Span;
use prop_house::common::libraries::round::{Asset, UserStrategy};
use prop_house::common::utils::constants::ETHEREUM_PREFIX;
use prop_house::common::utils::hash::keccak_u256s_be;
use prop_house::common::utils::constants::TypeHash;
use prop_house::common::utils::endian::ByteReverse;
use prop_house::common::utils::endian;
use array::{ArrayTrait, SpanTrait};
use traits::{Into, TryInto};
use option::OptionTrait;

trait KeccakTypeHash<T> {
    fn hash(self: T) -> u256;
}

impl KeccakTypeHashFelt252Span of KeccakTypeHash<Span<felt252>> {
    fn hash(self: Span<felt252>) -> u256 {
        keccak_u256s_be(self.into())
    }
}

impl KeccakTypeHashStructSpan<
    T, impl TCopy: Copy<T>, impl TKeccakTypeHash: KeccakTypeHash<T>
> of KeccakTypeHash<Span<T>> {
    fn hash(mut self: Span<T>) -> u256 {
        let mut encoded_data = ArrayTrait::new();
        loop {
            match self.pop_front() {
                Option::Some(item) => {
                    encoded_data.append((*item).hash());
                },
                Option::None(()) => {
                    break keccak_u256s_be(encoded_data.span());
                },
            };
        }
    }
}

impl KeccakTypeHashUserStrategy of KeccakTypeHash<UserStrategy> {
    fn hash(self: UserStrategy) -> u256 {
        let mut encoded_data = array![
            TypeHash::USER_STRATEGY,
            self.id.into(),
            self.user_params.hash(),
        ];
        keccak_u256s_be(encoded_data.span())
    }
}

impl KeccakTypeHashAsset of KeccakTypeHash<Asset> {
    fn hash(self: Asset) -> u256 {
        let mut encoded_data = array![
            TypeHash::ASSET,
            self.asset_id,
            self.amount,
        ];
        keccak_u256s_be(encoded_data.span())
    }
}

/// Hashes typed data according to the EIP-712 specification.
fn hash_typed_data(domain_hash: u256, message_hash: u256) -> u256 {
    let encoded_data = add_prefix_array(
        array![domain_hash, message_hash],
        ETHEREUM_PREFIX
    );
    let (mut u64_arr, overflow) = endian::into_le_u64_array(encoded_data);
    keccak::cairo_keccak(ref u64_arr, overflow, 2).byte_reverse()
}

/// Prefixes a 16 bit prefix to an array of 256 bit values.
fn add_prefix_array(input: Array<u256>, mut prefix: u128) -> Array<u256> {
    let mut out = ArrayTrait::<u256>::new();
    let mut input = input;
    loop {
        match input.pop_front() {
            Option::Some(num) => {
                let (w1, high_carry) = add_prefix_u128(num.high, prefix);
                let (w0, low_carry) = add_prefix_u128(num.low, high_carry);
                out.append(u256 { low: w0, high: w1 });
                prefix = low_carry;
            },
            Option::None(_) => {
                // left shift so that the prefix is in the high bits
                out.append(
                    u256 {
                        high: prefix * 0x10000000000000000000000000000_u128, low: 0_u128
                    }
                );
                break ();
            }
        };
    };
    out
}

/// Adds a 16 bit prefix to a 128 bit input, returning the result and a carry.
fn add_prefix_u128(input: u128, prefix: u128) -> (u128, u128) {
    let with_prefix = u256 { low: input, high: prefix };
    let carry = with_prefix & 0xffff;
    // Removing the carry and shifting back.
    let out = (with_prefix - carry) / 0x10000;
    (out.low, carry.low)
}
