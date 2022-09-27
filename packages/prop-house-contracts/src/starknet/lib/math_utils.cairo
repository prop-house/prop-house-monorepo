%lang starknet

from starkware.cairo.common.math_cmp import is_le

namespace MathUtils:
    # Returns the minimum of two values
    func min{range_check_ptr}(x : felt, y : felt) -> (res : felt):
        let (x_le) = is_le(x, y)

        if x_le == 1:
            return (x)
        else:
            return (y)
        end
    end

    # Returns the maximum of two values
    func max{range_check_ptr}(x : felt, y : felt) -> (res : felt):
        let (x_le) = is_le(x, y)

        if x_le == 1:
            return (y)
        else:
            return (x)
        end
    end
end
