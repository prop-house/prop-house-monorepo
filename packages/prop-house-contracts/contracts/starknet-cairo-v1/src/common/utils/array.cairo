use array::ArrayTrait;
use hash::LegacyHash;

trait ArrayTraitExt<T> {
    fn append_all(ref self: Array::<T>, ref arr: Array::<T>);
    fn occurrences_of<impl TDrop: Drop<T>, impl TPartialEq: PartialEq<T>>(
        ref self: Array::<T>, item: T
    ) -> usize;
}

impl ArrayImpl<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>> of ArrayTraitExt<T> {
    fn append_all(ref self: Array::<T>, ref arr: Array::<T>) {
        match arr.pop_front() {
            Option::Some(v) => {
                self.append(v);
                self.append_all(ref arr);
            },
            Option::None(()) => (),
        }
    }

    fn occurrences_of<impl TDrop: Drop<T>, impl TPartialEq: PartialEq<T>>(
        ref self: Array::<T>, item: T
    ) -> usize {
        _occurrences_of_loop(ref self, item, 0, 0)
    }
}

/// Asserts that the array does not contain any duplicates.
/// * `arr` - The array to check.
fn assert_no_duplicates<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>, impl TPartialEq: PartialEq<T>>(
    ref arr: Array::<T>
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
    ref dst: Array::<T>, src: @Array::<T>, index: u32, count: u32
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
/// * `Array::<T>` - The slice of the array.
fn array_slice<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>>(
    src: @Array::<T>, begin: usize, end: usize
) -> Array::<T> {
    let mut slice = ArrayTrait::<T>::new();
    fill_array(ref dst: slice, :src, index: begin, count: end);
    slice
}

/// Returns the pedersen hash of an array.
/// * `arr` - The array to hash.
fn array_hash(arr: @Array::<felt252>) -> felt252 {
    _array_hash_internal(arr, *arr.at(0), 1)
}

/// Recursively hashes an array.
/// * `arr` - The array to hash.
/// * `state` - The current hash state.
/// * `index` - The current index.
fn _array_hash_internal(arr: @Array::<felt252>, mut state: felt252, index: u32, ) -> felt252 {
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
fn _occurrences_of_loop<T, impl TDrop: Drop<T>, impl TPartialEq: PartialEq<T>, impl TCopy: Copy<T>>(
    ref arr: Array<T>, item: T, index: usize, count: usize
) -> usize {
    if index >= arr.len() {
        count
    } else if *arr.at(
        index
    ) == item {
        _occurrences_of_loop(ref arr, item, index + 1, count + 1)
    } else {
        _occurrences_of_loop(ref arr, item, index + 1, count)
    }
}
