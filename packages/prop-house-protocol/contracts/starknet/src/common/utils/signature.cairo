use prop_house::common::utils::array::Felt252SpanIntoU256Span;
use prop_house::common::libraries::round::{Asset, UserStrategy};
use prop_house::common::utils::constants::ETHEREUM_PREFIX;
use prop_house::common::utils::hash::keccak_u256s_be;
use prop_house::common::utils::constants::TypeHash;
use array::{ArrayTrait, SpanTrait};
use traits::Into;

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
        let mut encoded_data = Default::default();
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
        let mut encoded_data = Default::default();
        encoded_data.append(TypeHash::USER_STRATEGY);
        encoded_data.append(self.id.into());
        encoded_data.append(self.user_params.hash());
        keccak_u256s_be(encoded_data.span())
    }
}

impl KeccakTypeHashAsset of KeccakTypeHash<Asset> {
    fn hash(self: Asset) -> u256 {
        let mut encoded_data = Default::default();
        encoded_data.append(TypeHash::ASSET);
        encoded_data.append(self.asset_id);
        encoded_data.append(self.amount);
        keccak_u256s_be(encoded_data.span())
    }
}

/// Hash structured EIP-712 data, including the ethereum prefix,
// domain separator, and the message itself.
/// * `domain_separator` - The domain separator.
/// * `message` - The message to hash.
fn hash_structured_data(domain_separator: u256, message: Span<u256>) -> u256 {
    let hash_struct = keccak_u256s_be(message);

    let mut data = Default::default();
    data.append(ETHEREUM_PREFIX.into());
    data.append(domain_separator);
    data.append(hash_struct);

    keccak_u256s_be(data.span())
}
