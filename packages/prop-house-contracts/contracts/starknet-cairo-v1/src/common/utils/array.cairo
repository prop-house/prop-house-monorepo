use array::{ArrayTrait, SpanTrait};
use integer::Felt252TryIntoU32;
use traits::{Into, TryInto};
use option::OptionTrait;
use hash::LegacyHash;

trait ArrayTraitExt<T> {
    fn append_all(ref self: Array<T>, ref arr: Array<T>);
    fn occurrences_of<impl TDrop: Drop<T>, impl TPartialEq: PartialEq<T>>(
        ref self: Array<T>, item: T
    ) -> usize;
}

impl ArrayImpl<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>> of ArrayTraitExt<T> {
    fn append_all(ref self: Array<T>, ref arr: Array<T>) {
        match arr.pop_front() {
            Option::Some(v) => {
                self.append(v);
                self.append_all(ref arr);
            },
            Option::None(()) => (),
        }
    }

    fn occurrences_of<impl TDrop: Drop<T>, impl TPartialEq: PartialEq<T>>(
        ref self: Array<T>, item: T
    ) -> usize {
        _occurrences_of_internal(ref self, item, 0, 0)
    }
}

#[derive(Drop)]
struct Immutable2DArray {
    offsets: Array<felt252>,
    elements: Array<felt252>,
}

/// Construct an Immutable2D array from a flat encoding.
/// The structure of the flat array that is passed should be as follows:
/// flat_array[0] = num_arrays
/// flat_array[1:1+num_arrays] = offsets
/// flat_array[1+num_arrays:] = elements
/// * `flat_array` - The flat array to construct the 2D array from.
fn construct_2d_array(flat_array: Span<felt252>) -> Immutable2DArray {
    let offsets_len = (*flat_array.at(0)).try_into().unwrap();
    let offsets = array_slice(flat_array, 1, offsets_len);
    let elements_len = flat_array.len() - offsets_len - 1;
    let elements = array_slice(flat_array, offsets_len + 1, elements_len);

    Immutable2DArray { offsets, elements }
}

/// Extracts a sub array at the specified index from an Immutable2DArray
/// * `array_2d` - The 2D array to extract the sub array from.
/// * `index` - The index of the sub array to extract.
fn get_sub_array(array_2d: @Immutable2DArray, index: u32) -> Array<felt252> {
    let offset = (*array_2d.offsets[index]).try_into().unwrap();
    let last_index = array_2d.offsets.len() - 1;

    let mut array_len = 0;
    if index == last_index {
        array_len = array_2d.elements.len() - offset;
    } else {
        array_len = (*array_2d.offsets[index + 1]).try_into().unwrap() - offset;
    }
    array_slice(array_2d.elements.span(), offset, array_len)
}

/// Asserts that the array does not contain any duplicates.
/// * `arr` - The array to check.
fn assert_no_duplicates<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>, impl TPartialEq: PartialEq<T>>(
    ref arr: Array<T>
) {
    let arr_len = arr.len();
    if arr_len == 0 {
        return ();
    }

    let mut i = 0;
    loop {
        if i == arr_len {
            break ();
        }

        assert(arr.occurrences_of(*arr.at(i)) == 1, 'Duplicate element found');
        i += 1;
    }
}

// Fill an array with a value.
/// * `dst` - The array to fill.
/// * `src` - The array to fill with.
/// * `index` - The index to start filling at.
/// * `count` - The number of elements to fill.
fn fill_array<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>>(
    ref dst: Array<T>, src: Span<T>, index: u32, count: u32
) {
    if count == 0 {
        return ();
    }
    if index >= src.len() {
        return ();
    }
    let element = src.at(index);
    dst.append(*element);

    fill_array(ref dst, src, index + 1, count - 1)
}

/// Returns the slice of an array.
/// * `arr` - The array to slice.
/// * `begin` - The index to start the slice at.
/// * `end` - The index to end the slice at (not included).
/// # Returns
/// * `Array<T>` - The slice of the array.
fn array_slice<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>>(
    src: Span<T>, begin: usize, end: usize
) -> Array<T> {
    let mut slice = ArrayTrait::new();
    fill_array(ref dst: slice, :src, index: begin, count: end);
    slice
}

/// Convert a span of `felt252` to a `u256` array.
/// * `data` - The data to convert.
fn into_u256_arr(mut data: Span<felt252>) -> Array<u256> {
    let mut arr = ArrayTrait::<u256>::new();
    loop {
        match data.pop_front() {
            Option::Some(item) => {
                let item = *item;
                arr.append(item.into());
            },
            Option::None(_) => {
                break ();
            },
        };
    };
    arr
}

/// Returns the pedersen hash of an array.
/// * `arr` - The array to hash.
fn array_hash(arr: @Array<felt252>) -> felt252 {
    _array_hash_internal(arr, *arr.at(0), 1)
}

/// Recursively hashes an array.
/// * `arr` - The array to hash.
/// * `state` - The current hash state.
/// * `index` - The current index.
fn _array_hash_internal(arr: @Array<felt252>, mut state: felt252, index: u32) -> felt252 {
    if (index == arr.len()) {
        return state;
    }
    state = LegacyHash::hash(state, *arr.at(index));

    _array_hash_internal(arr, state, index + 1)
}

/// Returns the number of occurrences of an item in an array.
/// * `arr` - The array to search.
/// * `item` - The item to search for.
/// * `index` - The current index.
/// * `count` - The current count.
fn _occurrences_of_internal<T,
impl TDrop: Drop<T>,
impl TPartialEq: PartialEq<T>,
impl TCopy: Copy<T>>(
    ref arr: Array<T>, item: T, index: usize, count: usize
) -> usize {
    if index >= arr.len() {
        count
    } else if *arr.at(
        index
    ) == item {
        _occurrences_of_internal(ref arr, item, index + 1, count + 1)
    } else {
        _occurrences_of_internal(ref arr, item, index + 1, count)
    }
}
