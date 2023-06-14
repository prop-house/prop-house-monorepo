use starknet::{
    EthAddress, Felt252TryIntoEthAddress, ContractAddress, ContractAddressIntoFelt252,
    SyscallResult, StorageAccess, StorageBaseAddress, contract_address_to_felt252
};
use prop_house::common::utils::constants::{U250_HIGH_BOUND, U250_MAX_FELT};
use traits::{Into, TryInto};
use integer::BoundedInt;
use option::OptionTrait;
use zeroable::Zeroable;
use hash::LegacyHash;

fn as_u256(high: u128, low: u128) -> u256 {
    u256 { low, high }
}

impl ContractAddressIntoU256 of Into<ContractAddress, u256> {
    fn into(self: ContractAddress) -> u256 {
        contract_address_to_felt252(self).into()
    }
}

impl U256TryIntoEthAddress of TryInto<u256, EthAddress> {
    fn try_into(self: u256) -> Option<EthAddress> {
        let intermediate: Option<felt252> = self.try_into();
        match intermediate {
            Option::Some(felt) => felt.try_into(),
            Option::None(()) => Option::None(())
        }
    }
}

impl U256TryIntoU250 of TryInto<u256, u250> {
    fn try_into(self: u256) -> Option<u250> {
        let intermediate: Option<felt252> = self.try_into();
        match intermediate {
            Option::Some(felt) => felt.try_into(),
            Option::None(()) => Option::None(())
        }
    }
}

impl U256TryIntoU64 of TryInto<u256, u64> {
    fn try_into(self: u256) -> Option<u64> {
        let intermediate: Option<felt252> = self.try_into();
        match intermediate {
            Option::Some(felt) => felt.try_into(),
            Option::None(()) => Option::None(())
        }
    }
}

impl U256TryIntoU16 of TryInto<u256, u16> {
    fn try_into(self: u256) -> Option<u16> {
        let intermediate: Option<felt252> = self.try_into();
        match intermediate {
            Option::Some(felt) => felt.try_into(),
            Option::None(()) => Option::None(())
        }
    }
}

impl U256TryIntoU8 of TryInto<u256, u8> {
    fn try_into(self: u256) -> Option<u8> {
        let intermediate: Option<felt252> = self.try_into();
        match intermediate {
            Option::Some(felt) => felt.try_into(),
            Option::None(()) => Option::None(())
        }
    }
}

#[derive(Copy, Drop, Serde)]
struct u250 {
    inner: felt252
}

trait u250Trait {
    fn new(inner: felt252) -> u250;
}

impl U250Impl of u250Trait {
    fn new(inner: felt252) -> u250 {
        u250 { inner }
    }
}

impl U250PartialEq of PartialEq<u250> {
    fn eq(lhs: u250, rhs: u250) -> bool {
        lhs.inner == rhs.inner
    }

    fn ne(lhs: u250, rhs: u250) -> bool {
        lhs.inner != rhs.inner
    }
}

impl Felt252IntoU250 of Into<felt252, u250> {
    fn into(self: felt252) -> u250 {
        u250 { inner: self }
    }
}

impl Felt252TryIntoU250 of TryInto<felt252, u250> {
    fn try_into(self: felt252) -> Option<u250> {
        let v: u256 = self.into();
        if v.high > U250_HIGH_BOUND {
            return Option::None(());
        }
        Option::Some(u250 { inner: self })
    }
}

impl ContractAddressIntoU250 of Into<ContractAddress, u250> {
    fn into(self: ContractAddress) -> u250 {
        u250 { inner: self.into() }
    }
}

impl U32IntoU250 of Into<u32, u250> {
    fn into(self: u32) -> u250 {
        u250 { inner: self.into() }
    }
}

impl U250IntoFelt252 of Into<u250, felt252> {
    fn into(self: u250) -> felt252 {
        self.inner
    }
}

impl LegacyHashU250 of LegacyHash<u250> {
    fn hash(state: felt252, value: u250) -> felt252 {
        LegacyHash::hash(state, U250IntoFelt252::into(value))
    }
}

impl StorageAccessU250 of StorageAccess<u250> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<u250> {
        StorageAccessU250::read_at_offset_internal(address_domain, base, 0)
    }
    fn write(address_domain: u32, base: StorageBaseAddress, value: u250) -> SyscallResult<()> {
        StorageAccessU250::write_at_offset_internal(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8
    ) -> SyscallResult<u250> {
        Result::Ok(
            Felt252TryIntoU250::try_into(
                StorageAccess::read_at_offset_internal(address_domain, base, offset)?
            ).expect('StorageAccessU250: non u250')
        )
    }
    #[inline(always)]
    fn write_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, offset: u8, value: u250
    ) -> SyscallResult<()> {
        StorageAccess::write_at_offset_internal(address_domain, base, offset, U250IntoFelt252::into(value))
    }
    #[inline(always)]
    fn size_internal(value: u250) -> u8 {
        1
    }
}

impl U250Zeroable of Zeroable<u250> {
    #[inline(always)]
    fn zero() -> u250 {
        u250 { inner: 0 }
    }

    #[inline(always)]
    fn is_zero(self: u250) -> bool {
        self.inner == 0
    }

    #[inline(always)]
    fn is_non_zero(self: u250) -> bool {
        self.inner != 0
    }
}

impl U250BoundedInt of BoundedInt<u250> {
    #[inline(always)]
    fn min() -> u250 nopanic {
        u250 { inner: 0 }
    }

    #[inline(always)]
    fn max() -> u250 nopanic {
        u250 { inner: U250_MAX_FELT }
    }
}

impl U250Add of Add<u250> {
    #[inline(always)]
    fn add(lhs: u250, rhs: u250) -> u250 {
        let r = u250 { inner: lhs.inner + rhs.inner };
        let r256: u256 = r.inner.into();
        assert(r256.high <= U250_HIGH_BOUND, 'u250 overflow');
        r
    }
}

impl U250AddEq of AddEq<u250> {
    #[inline(always)]
    fn add_eq(ref self: u250, other: u250) {
        self = self + other;
    }
}

impl U250Sub of Sub<u250> {
    #[inline(always)]
    fn sub(lhs: u250, rhs: u250) -> u250 {
        let lhs256: u256 = lhs.inner.into();
        let rhs256: u256 = rhs.inner.into();
        assert(lhs256 >= rhs256, 'u250 underflow');
        u250 { inner: (lhs256 - rhs256).try_into().unwrap() }
    }
}

impl U250SubEq of SubEq<u250> {
    #[inline(always)]
    fn sub_eq(ref self: u250, other: u250) {
        self = self - other;
    }
}
