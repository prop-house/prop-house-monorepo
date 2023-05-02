use zeroable::Zeroable;

fn as_u256(high: u128, low: u128) -> u256 {
    u256 { low, high }
}

/// Canonical implementation of Zeroable for u256.
impl U256Zeroable of Zeroable<u256> {
    #[inline(always)]
    fn zero() -> u256 {
        as_u256(0, 0)
    }

    #[inline(always)]
    fn is_zero(self: u256) -> bool {
        self == U256Zeroable::zero()
    }

    #[inline(always)]
    fn is_non_zero(self: u256) -> bool {
        !self.is_zero()
    }
}
