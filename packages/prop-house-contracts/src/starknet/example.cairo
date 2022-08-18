%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin

# An example event
@event
func example_event(example_data : felt):
end

# Emit an example event
@external
func emit_example_event{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
    example_event.emit(example_data=42)
    return ()
end
