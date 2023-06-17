const UINT64_MAX_FELT: felt252 = 0xFFFFFFFFFFFFFFFF;

const MASK_8: u256 = 0xFF;
const MASK_16: u256 = 0xFFFF;
const MASK_64: u256 = 0xFFFFFFFFFFFFFFFF;
const MASK_160: u256 = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
const MASK_192: u256 = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
const MASK_250: u256 = 0x03FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;

const TWO_POW_8: u256 = 0x100;
const TWO_POW_24: u256 = 0x1000000;
const TWO_POW_72: u256 = 0x1000000000000000000;
const TWO_POW_88: u256 = 0x10000000000000000000000;
const TWO_POW_152: u256 = 0x100000000000000000000000000000000000000;
const TWO_POW_160: u256 = 0x10000000000000000000000000000000000000000;
const TWO_POW_168: u256 = 0x1000000000000000000000000000000000000000000;
const TWO_POW_224: u256 = 0x100000000000000000000000000000000000000000000000000000000;
const TWO_POW_232: u256 = 0x10000000000000000000000000000000000000000000000000000000000;

const ETHEREUM_PREFIX: felt252 = 0x1901;

mod RoundType {
    /// The infinite round type.
    const INFINITE: felt252 = 'INFINITE';
    /// The timed round type.
    const TIMED: felt252 = 'TIMED';
}

mod DependencyKey {
    /// The key of the execution strategy dependency.
    const EXECUTION_STRATEGY: felt252 = 'EXECUTION_STRATEGY';
    /// The key of the auth strategy dependencies.
    const AUTH_STRATEGIES: felt252 = 'AUTH_STRATEGIES';
}

mod StrategyType {
    /// The proposing strategy type.
    const PROPOSING: u8 = 0;
    /// The voting strategy type.
    const VOTING: u8 = 1;
}

/// Shared EIP-712 type hashes
mod TypeHash {
    /// The type hash for the user strategy struct.
    /// keccak256("UserStrategy(uint256 id,uint256 userParams)")
    const USER_STRATEGY: u256 = 0x8aaa80dfcb3cca3d568544a9ec6b47935b08f24f605db3783699672fed2de807;

    /// The type hash for the asset struct.
    /// keccak256("Asset(uint256 assetId,uint256 amount)")
    const ASSET: u256 = 0x02dc1e9b01d93582b7ab99b2d9cbb7ea32206fb5e17210680b8ed1f4e41f4f84;
}
