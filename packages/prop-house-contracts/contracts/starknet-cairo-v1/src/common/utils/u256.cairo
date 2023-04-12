use zeroable::Zeroable;

/// Canonical implementation of Zeroable for u256.
impl U256Zeroable of Zeroable<u256> {
    #[inline(always)]
    fn zero() -> u256 {
        u256 { low: 0_u128, high: 0_u128 }
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
