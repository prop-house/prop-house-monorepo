use starknet::{StorageAccess, SyscallResult, StorageBaseAddress};
use prop_house::common::utils::constants::{MASK_16, MASK_32};
use prop_house::common::utils::integer::U256TryIntoU32;
use prop_house::common::utils::hash::keccak_u256s_be;
use prop_house::common::utils::vec::{Vec, VecTrait};
use integer::{downcast, u256_from_felt252};
use array::{ArrayTrait, SpanTrait};
use starknet::SyscallResultTrait;
use traits::{Into, TryInto};
use option::OptionTrait;

/// Returns the key for `mapping_key` at slot `slot_index`.
/// * `slot_index` - The slot index.
/// * `mapping_key` - The mapping key.
fn get_slot_key(slot_index: felt252, mapping_key: felt252) -> u256 {
    let mut encoded_array = Default::default();
    encoded_array.append(mapping_key.into());
    encoded_array.append(slot_index.into());

    keccak_u256s_be(encoded_array.span())
}

/// Read a generic span from storage.
/// * `address_domain` - The address domain.
/// * `base` - The base address.
/// * `offset` - The storage offset.
fn read_span<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>, impl TSA: StorageAccess<T>>(
    address_domain: u32, base: StorageBaseAddress, mut offset: u8
) -> SyscallResult<Span<T>> {
    let length = StorageAccess::<u32>::read_at_offset_internal(address_domain, base, offset)?;
    offset += 1; // Increment offset by 1 for the length.

    let mut elements_read = 0;
    let mut arr = Default::<Array<T>>::default();
    loop {
        if elements_read == length {
            break Result::Ok(arr.span());
        }
        let value = StorageAccess::read_at_offset_internal(address_domain, base, offset)?;
        offset += StorageAccess::<T>::size_internal(value);
        arr.append(value);

        elements_read += 1;
    }
}

/// Write a generic span to storage.
/// * `address_domain` - The address domain.
/// * `base` - The base address.
/// * `offset` - The storage offset.
/// * `value` - The value to write.
fn write_span<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>, impl TSA: StorageAccess<T>>(
    address_domain: u32, base: StorageBaseAddress, mut offset: u8, mut value: Span<T>
) -> SyscallResult<()> {
    StorageAccess::<u32>::write_at_offset_internal(address_domain, base, offset, value.len())?;
    offset += 1; // Increment offset by 1 for the length.

    loop {
        match value.pop_front() {
            Option::Some(v) => {
                let v = *v;
                StorageAccess::write_at_offset_internal(address_domain, base, offset, v)?;
                offset += StorageAccess::<T>::size_internal(v);
            },
            Option::None(_) => {
                break Result::Ok(());
            },
        };
    }
}

impl SpanStorageAccess<
    T, impl TCopy: Copy<T>, impl TDrop: Drop<T>, impl TSA: StorageAccess<T>
> of StorageAccess<Span<T>> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Span<T>> {
        SpanStorageAccess::read_at_offset_internal(address_domain, base, 0)
    }
    fn write(
        address_domain: u32, base: StorageBaseAddress, mut value: Span<T>
    ) -> SyscallResult<()> {
        SpanStorageAccess::write_at_offset_internal(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, mut offset: u8
    ) -> SyscallResult<Span<T>> {
        read_span(address_domain, base, offset)
    }
    #[inline(always)]
    fn write_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, mut offset: u8, mut value: Span<T>
    ) -> SyscallResult<()> {
        write_span(address_domain, base, offset, value)
    }
    fn size_internal(value: Span<T>) -> u8 {
        1 + (SpanStorageAccess::<T>::size_internal(value) * downcast(value.len()).unwrap())
    }
}

/// Get the scale factor for packing and unpacking the vec length.
fn get_vec_len_scale_factor() -> u256 {
    0x10000000000000000000000000000000000000000000000000000
}

/// Get the scale factors for packing and unpacking u32s.
fn get_u32_scale_factors() -> Span<u256> {
    let mut scale_factors = Default::default();
    scale_factors.append(0x1);
    scale_factors.append(0x100000000);
    scale_factors.append(0x10000000000000000);
    scale_factors.append(0x1000000000000000000000000);
    scale_factors.append(0x100000000000000000000000000000000);
    scale_factors.append(0x10000000000000000000000000000000000000000);
    scale_factors.append(0x1000000000000000000000000000000000000000000000000);
    scale_factors.span()
}

/// Read a u32 vec from storage.
/// * `address_domain` - The address domain.
/// * `base` - The base address.
/// * `offset` - The storage offset.
fn read_packed_u32_vec(address_domain: u32, base: StorageBaseAddress, mut offset: u8) -> SyscallResult<Vec<u32>> {
    let mut scale_factors = get_u32_scale_factors();
    let mut vec = VecTrait::new();

    let mut slot = u256_from_felt252(StorageAccess::read_at_offset_internal(address_domain, base, offset)?);
    let mut remaining_length = ((slot / get_vec_len_scale_factor()) & MASK_16).try_into().unwrap();

    let mut mask_index = 0;
    loop {
        if remaining_length == 0 {
            break;
        }
        if mask_index == 7 {
            offset += 1;
            slot = u256_from_felt252(StorageAccess::read_at_offset_internal(address_domain, base, offset).unwrap_syscall());
            mask_index = 0;
        }

        vec.push(((slot / *scale_factors.at(mask_index)) & MASK_32).try_into().unwrap());
        remaining_length -= 1;
        mask_index += 1;
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
            StorageAccess::<felt252>::write_at_offset_internal(address_domain, base, offset, packed.try_into().unwrap()).unwrap_syscall();
            packed = 0;
            packed_index = 0;
            offset += 1;
        }

        packed = packed | (u256_from_felt252(vec.at(vec_index).into()) * *scale_factors.at(packed_index));
        vec_index += 1;
        packed_index += 1;
    };
    if packed_index > 0 {
        StorageAccess::<felt252>::write_at_offset_internal(address_domain, base, offset, packed.try_into().unwrap())?;
    }

    Result::Ok(())
}

impl PackedU32VecStorageAccess of StorageAccess<Vec<u32>> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Vec<u32>> {
        PackedU32VecStorageAccess::read_at_offset_internal(address_domain, base, 0)
    }
    fn write(
        address_domain: u32, base: StorageBaseAddress, mut value: Vec<u32>
    ) -> SyscallResult<()> {
        PackedU32VecStorageAccess::write_at_offset_internal(address_domain, base, 0, value)
    }
    #[inline(always)]
    fn read_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, mut offset: u8
    ) -> SyscallResult<Vec<u32>> {
        read_packed_u32_vec(address_domain, base, offset)
    }
    #[inline(always)]
    fn write_at_offset_internal(
        address_domain: u32, base: StorageBaseAddress, mut offset: u8, mut value: Vec<u32>
    ) -> SyscallResult<()> {
        write_packed_u32_vec(address_domain, base, offset, ref value)
    }
    fn size_internal(value: Vec<u32>) -> u8 {
        // Add `6` to ensure the size is rounded up
        ((value.len() + 6) / 7).try_into().unwrap()
    }
}
