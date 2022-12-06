%lang starknet

from starkware.cairo.common.uint256 import Uint256, uint256_check
from starkware.cairo.common.cairo_builtins import HashBuiltin

from contracts.starknet.common.lib.math_utils import MathUtils

@storage_var
func whitelist(address: felt) -> (voting_power: Uint256) {
}

@event
func whitelisted(address: felt, voting_power: Uint256) {
}

@constructor
func constructor{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr: felt}(
    _whitelist_len: felt, _whitelist: felt*
) {
    _register_whitelist(_whitelist_len, _whitelist);
    return ();
}

@view
func get_voting_power{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr: felt}(
    timestamp: felt,
    voter_address: felt,
    params_len: felt,
    params: felt*,
    user_params_len: felt,
    user_params: felt*,
) -> (voting_power: Uint256) {
    let (power) = whitelist.read(voter_address);

    // `power` will be set to 0 if other is not whitelisted
    return (power,);
}

func _register_whitelist{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr: felt}(
    _whitelist_len: felt, _whitelist: felt*
) {
    if (_whitelist_len == 0) {
        return ();
    } else {
        let address = _whitelist[0];
        // Add it to the whitelist
        let voting_power = Uint256(_whitelist[1], _whitelist[2]);

        MathUtils.assert_valid_uint256(voting_power);

        whitelist.write(address, voting_power);
        whitelisted.emit(address, voting_power);
        _register_whitelist(_whitelist_len - 3, &_whitelist[3]);
        return ();
    }
}
