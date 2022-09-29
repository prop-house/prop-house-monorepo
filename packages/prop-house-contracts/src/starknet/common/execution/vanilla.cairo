%lang starknet

from starkware.cairo.common.uint256 import Uint256

@external
func execute{syscall_ptr : felt*}(execution_params_len : felt, execution_params : felt*):
    return ()
end
