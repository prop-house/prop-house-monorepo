use traits::{Into, TryInto, Destruct};
use array::{ArrayTrait, SpanTrait};
use integer::U128IntoFelt252;
use dict::Felt252DictTrait;
use option::OptionTrait;
use zeroable::Zeroable;
use box::BoxTrait;

trait ArrayTraitExt<T> {
    fn append_all(ref self: Array<T>, span: Span<T>);
    fn contains<impl TPartialEq: PartialEq<T>>(self: @Array<T>, item: T) -> bool;
}

trait SpanTraitExt<T> {
    fn contains<impl TPartialEq: PartialEq<T>>(self: Span<T>, item: T) -> bool;
}

impl ArrayImpl<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>> of ArrayTraitExt<T> {
    fn append_all(ref self: Array<T>, mut span: Span<T>) {
        match span.pop_front() {
            Option::Some(v) => {
                self.append(*v);
                self.append_all(span);
            },
            Option::None(()) => (),
        }
    }

    fn contains<impl TPartialEq: PartialEq<T>>(self: @Array<T>, item: T) -> bool {
        self.span().contains(item)
    }
}

impl SpanImpl<T, impl TCopy: Copy<T>, impl TDrop: Drop<T>> of SpanTraitExt<T> {
    fn contains<impl TPartialEq: PartialEq<T>>(mut self: Span<T>, item: T) -> bool {
        loop {
            match self.pop_front() {
                Option::Some(v) => {
                    if *v == item {
                        break true;
                    }
                },
                Option::None(_) => {
                    break false;
                },
            };
        }
    }
}

// TODO: Optimally, we remove the need for this.
#[derive(Copy, Drop)]
struct Immutable2DArray {
    offsets: Span<felt252>,
    elements: Span<felt252>,
}

/// Construct an Immutable2D array from a flat encoding.
/// The structure of the flat array that is passed should be as follows:
/// flat_array[0] = num_arrays
/// flat_array[1:1+num_arrays] = offsets
/// flat_array[1+num_arrays:] = elements
/// * `flat_array` - The flat array to construct the 2D array from.
fn construct_2d_array(flat_array: Span<felt252>) -> Immutable2DArray {
    let offsets_len = (*flat_array.at(0)).try_into().unwrap();
    let offsets = flat_array.slice(1, offsets_len);
    let elements_len = flat_array.len() - offsets_len - 1;
    let elements = flat_array.slice(offsets_len + 1, elements_len);

    Immutable2DArray { offsets, elements }
}

/// Extracts a sub array at the specified index from an Immutable2DArray
/// * `array_2d` - The 2D array to extract the sub array from.
/// * `index` - The index of the sub array to extract.
fn get_sub_array(array_2d: Immutable2DArray, index: u32) -> Span<felt252> {
    let offset = (*array_2d.offsets.at(index)).try_into().unwrap();
    let last_index = array_2d.offsets.len() - 1;

    let mut array_len = 0;
    if index == last_index {
        array_len = array_2d.elements.len() - offset;
    } else {
        array_len = (*array_2d.offsets.at(index + 1)).try_into().unwrap() - offset;
    }
    array_2d.elements.slice(offset, array_len)
}

/// Asserts that the felt252 span does not contain any duplicates.
/// * `span` - The span to check.
fn assert_no_duplicates(mut span: Span<felt252>) {
    if span.len() < 2 {
        return;
    }

    let mut dict: Felt252Dict<felt252> = Default::default();
    loop {
        match span.pop_front() {
            Option::Some(v) => {
                assert(dict.get(*v).is_zero(), 'Duplicate element found');
                dict.insert(*v, 1);
            },
            Option::None(()) => {
                break;
            },
        };
    };
    dict.squash();
}

/// Asserts that the u256 span does not contain any duplicates.
/// * `span` - The span to check.
fn assert_no_duplicates_u256(mut span: Span<u256>) {
    if span.len() < 2 {
        return;
    }

    // TODO: Consider sorting and comparing. This is a naive implementation.
    loop {
        match span.pop_front() {
            Option::Some(v) => {
                assert(span.contains(*v) == false, 'Duplicate element found');
            },
            Option::None(()) => {
                break;
            },
        };
    }
}

/// Convert a span of `felt252` to a `u256` array.
/// * `data` - The data to convert.
fn into_u256_arr(mut data: Span<felt252>) -> Array<u256> {
    let mut arr = Default::<Array<u256>>::default();
    loop {
        match data.pop_front() {
            Option::Some(item) => {
                let item = *item;
                arr.append(item.into());
            },
            Option::None(_) => {
                break;
            },
        };
    };
    arr
}
