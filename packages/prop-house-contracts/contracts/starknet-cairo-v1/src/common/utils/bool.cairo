use traits::{TryInto, Into };

impl BoolIntoFelt252 of Into<bool, felt252> {
    fn into(self: bool) -> felt252 {
        if self {
            1
        } else {
            0
        }
    }
}

impl Felt252TryIntoBool of TryInto<felt252, bool> {
    fn try_into(self: felt252) -> Option<bool> {
        if self == 0 {
            Option::Some(false)
        } else if self == 1 {
            Option::Some(true)
        } else {
            Option::None(())
        }
    }
}
