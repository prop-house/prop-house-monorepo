use starknet::{Store, SyscallResult, StorageBaseAddress};
use prop_house::common::utils::constants::{MASK_16, MASK_32};
use prop_house::common::utils::hash::keccak_u256s_be;
use prop_house::common::utils::vec::{Vec, VecTrait};
use array::{ArrayTrait, SpanTrait};
use starknet::SyscallResultTrait;
use integer::u256_from_felt252;
use traits::{Into, TryInto};
use option::OptionTrait;

/// Returns the key for `mapping_key` at slot `slot_index`.
/// * `slot_index` - The slot index.
/// * `mapping_key` - The mapping key.
fn get_slot_key(slot_index: u256, mapping_key: u256) -> u256 {
    let mut encoded_array = array![
        mapping_key, slot_index
    ];
    keccak_u256s_be(encoded_array.span())
}

/// Returns the nested key for `mapping_keys` at slot `slot_index`.
/// * `slot_index` - The slot index.
/// * `mapping_key` - The mapping key.
fn get_nested_slot_key(slot_index: u256, mut mapping_keys: Span<u256>) -> u256 {
    let outermost_mapping_key = *mapping_keys.pop_front().unwrap();
    let mut slot_key = get_slot_key(slot_index, outermost_mapping_key);
    loop {
        match mapping_keys.pop_front() {
            Option::Some(k) => {
                slot_key = get_slot_key(slot_key, *k);
            },
            Option::None(_) => {
                break slot_key;
            },
        };
    }
}

/// Read a generic span from storage.
/// * `address_domain` - The address domain.
/// * `base` - The base address.
/// * `offset` - The storage offset.
fn read_span<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>, impl TSA: Store<T>>(
    address_domain: u32, base: StorageBaseAddress, mut offset: u8
) -> SyscallResult<Span<T>> {
    let length = Store::<u32>::read_at_offset(address_domain, base, offset)?;
    offset += 1; // Increment offset by 1 for the length.

    let mut elements_read = 0;
    let mut arr = ArrayTrait::new();
    loop {
        if elements_read == length {
            break Result::Ok(arr.span());
        }
        let value = Store::read_at_offset(address_domain, base, offset)?;
        offset += Store::<T>::size();
        arr.append(value);

        elements_read += 1;
    }
}

/// Write a generic span to storage.
/// * `address_domain` - The address domain.
/// * `base` - The base address.
/// * `offset` - The storage offset.
/// * `value` - The value to write.
fn write_span<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>, impl TSA: Store<T>>(
    address_domain: u32, base: StorageBaseAddress, mut offset: u8, mut value: Span<T>
) -> SyscallResult<()> {
    if !value.is_empty() {
        assert(Store::<T>::size().into() * value.len() < 255, 'Span too large');
    }

    Store::<u32>::write_at_offset(address_domain, base, offset, value.len())?;
    offset += 1; // Increment offset by 1 for the length.

    loop {
        match value.pop_front() {
            Option::Some(v) => {
                let v = *v;
                Store::write_at_offset(address_domain, base, offset, v)?;
                offset += Store::<T>::size();
            },
            Option::None(_) => {
                break Result::Ok(());
            },
        };
    }
}

impl SpanStore<
    T, impl TCopy: Copy<T>, impl TDrop: Drop<T>, impl TSA: Store<T>
> of Store<Span<T>> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Span<T>> {
        SpanStore::read_at_offset(address_domain, base, 0)
    }
    fn write(
        address_domain: u32, base: StorageBaseAddress, mut value: Span<T>
    ) -> SyscallResult<()> {
        SpanStore::write_at_offset(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset(
        address_domain: u32, base: StorageBaseAddress, mut offset: u8
    ) -> SyscallResult<Span<T>> {
        read_span(address_domain, base, offset)
    }
    #[inline(always)]
    fn write_at_offset(
        address_domain: u32, base: StorageBaseAddress, mut offset: u8, mut value: Span<T>
    ) -> SyscallResult<()> {
        write_span(address_domain, base, offset, value)
    }
    fn size() -> u8 {
        255 // Reserve the entire offset slot.
    }
}

/// Get the scale factor for packing and unpacking the vec length.
fn get_vec_len_scale_factor() -> u256 {
    0x100000000000000000000000000000000000000000000000000000000
}

/// Get the scale factors for packing and unpacking u32s.
fn get_u32_scale_factors() -> Span<u256> {
    let mut scale_factors = array![
        0x1,
        0x100000000,
        0x10000000000000000,
        0x1000000000000000000000000,
        0x100000000000000000000000000000000,
        0x10000000000000000000000000000000000000000,
        0x1000000000000000000000000000000000000000000000000,
    ];
    scale_factors.span()
}

/// Read a u32 vec from storage.
/// * `address_domain` - The address domain.
/// * `base` - The base address.
/// * `offset` - The storage offset.
fn read_packed_u32_vec(address_domain: u32, base: StorageBaseAddress, mut offset: u8) -> SyscallResult<Vec<u32>> {
    let mut scale_factors = get_u32_scale_factors();
    let mut vec = VecTrait::new();

    let mut slot = u256_from_felt252(Store::read_at_offset(address_domain, base, offset)?);
    let mut remaining_length = ((slot / get_vec_len_scale_factor()) & MASK_16).try_into().unwrap();

    let mut packed_index = 0;
    loop {
        if remaining_length == 0 {
            break;
        }
        if packed_index == 7 {
            offset += 1;
            slot = u256_from_felt252(Store::read_at_offset(address_domain, base, offset).unwrap_syscall());
            packed_index = 0;
        }

        vec.push(((slot / *scale_factors.at(packed_index)) & MASK_32).try_into().unwrap());
        remaining_length -= 1;
        packed_index += 1;
    };
    Result::Ok(vec)
}

/// Write a u32 vec to storage.
/// * `address_domain` - The address domain.
/// * `base` - The base address.
/// * `offset` - The storage offset.
/// * `vec` - The vec to write.
fn write_packed_u32_vec(address_domain: u32, base: StorageBaseAddress, mut offset: u8, ref vec: Vec<u32>) -> SyscallResult<()> {
    let mut scale_factors = get_u32_scale_factors();
    let mut packed = 0;

    let vec_length = vec.len();
    let mut vec_index = 0;
    let mut packed_index = 0;

    // If not empty, pack the vec length into the slot.
    if vec_length > 0 {
        packed = packed | (u256_from_felt252(vec_length.into()) * get_vec_len_scale_factor());
    }

    loop {
        if vec_index == vec_length {
            break;
        }
        if packed_index == 7 {
            Store::<felt252>::write_at_offset(address_domain, base, offset, packed.try_into().unwrap()).unwrap_syscall();
            packed = 0;
            packed_index = 0;
            offset += 1;
        }

        packed = packed | (u256_from_felt252(vec.at(vec_index).into()) * *scale_factors.at(packed_index));
        vec_index += 1;
        packed_index += 1;
    };
    if packed_index > 0 {
        Store::<felt252>::write_at_offset(address_domain, base, offset, packed.try_into().unwrap())?;
    }

    Result::Ok(())
}

impl PackedU32VecStore of Store<Vec<u32>> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Vec<u32>> {
        PackedU32VecStore::read_at_offset(address_domain, base, 0)
    }
    fn write(
        address_domain: u32, base: StorageBaseAddress, mut value: Vec<u32>
    ) -> SyscallResult<()> {
        PackedU32VecStore::write_at_offset(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset(
        address_domain: u32, base: StorageBaseAddress, mut offset: u8
    ) -> SyscallResult<Vec<u32>> {
        read_packed_u32_vec(address_domain, base, offset)
    }
    #[inline(always)]
    fn write_at_offset(
        address_domain: u32, base: StorageBaseAddress, mut offset: u8, mut value: Vec<u32>
    ) -> SyscallResult<()> {
        write_packed_u32_vec(address_domain, base, offset, ref value)
    }
    fn size() -> u8 {
        255 // Reserve the entire offset slot.
    }
}
