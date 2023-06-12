use starknet::{StorageAccess, SyscallResult, StorageBaseAddress};
use prop_house::common::utils::hash::keccak_u256s_be;
use array::{ArrayTrait, SpanTrait};
use option::OptionTrait;
use integer::downcast;
use traits::Into;

/// Returns the key for `mapping_key` at slot `slot_index`.
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
    let exit_at = downcast(length).unwrap() + offset;

    let mut arr = Default::<Array<T>>::default();
    loop {
        if offset == exit_at {
            break Result::Ok(arr.span());
        }
        offset += 1;
        let value = StorageAccess::read_at_offset_internal(address_domain, base, offset)?;
        arr.append(value);
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

    loop {
        match value.pop_front() {
            Option::Some(s) => {
                offset += 1;
                StorageAccess::write_at_offset_internal(address_domain, base, offset, *s)?;
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
    #[inline(always)]
    fn size_internal(value: Span<T>) -> u8 {
        1 + downcast(value.len()).unwrap()
    }
}
