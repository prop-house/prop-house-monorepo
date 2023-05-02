use starknet::StorageAccess;
use starknet::SyscallResult;
use starknet::StorageBaseAddress;
use starknet::storage_read_syscall;
use starknet::storage_write_syscall;
use starknet::storage_address_from_base_and_offset;
use array::{ArrayTrait, SpanTrait};
use integer::{downcast, upcast};
use traits::{TryInto, Into};
use option::OptionTrait;

impl StorageAccessFelt252Span of StorageAccess<Span<felt252>> {
    fn read(address_domain: u32, base: StorageBaseAddress) -> SyscallResult<Span<felt252>> {
        let mut arr = ArrayTrait::new();

        let span_length_base = storage_address_from_base_and_offset(base, 0);
        let span_length = storage_read_syscall(
            address_domain, span_length_base
        )?.try_into().unwrap();

        let mut i = 0;
        loop {
            if i == span_length {
                break Result::Ok(arr.span());
            }

            let item_base = storage_address_from_base_and_offset(base, i + 1);
            arr.append(storage_read_syscall(address_domain, item_base)?);

            i += 1;
        }
    }
    fn write(
        address_domain: u32, base: StorageBaseAddress, value: Span<felt252>
    ) -> SyscallResult<()> {
        let span_length: u8 = downcast(value.len()).unwrap();

        let span_length_base = storage_address_from_base_and_offset(base, 0);
        storage_write_syscall(address_domain, span_length_base, span_length.into())?;

        let mut i = 0;
        loop {
            if i == span_length {
                break Result::Ok(());
            }

            let item_base = storage_address_from_base_and_offset(base, i + 1);
            storage_write_syscall(address_domain, item_base, *value.at(upcast(i)))?;

            i += 1;
        }
    }
}
