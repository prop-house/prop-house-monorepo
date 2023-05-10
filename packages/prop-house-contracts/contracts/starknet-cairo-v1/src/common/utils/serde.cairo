use serde::{serialize_array_helper, deserialize_array_helper};
use array::{ArrayTrait, SpanTrait};
use option::OptionTrait;
use serde::Serde;

impl SpanSerde<T, impl TSerde: Serde<T>, impl TDrop: Drop<T>> of Serde<Span<T>> {
    fn serialize(self: @Span<T>, ref output: Array<felt252>) {
        let self = *self;
        self.len().serialize(ref output);
        serialize_array_helper(self, ref output);
    }
    fn deserialize(ref serialized: Span<felt252>) -> Option<Span<T>> {
        let length = *serialized.pop_front()?;
        let mut arr = ArrayTrait::<T>::new();
        Option::Some(deserialize_array_helper(ref serialized, arr, length)?.span())
    }
}
