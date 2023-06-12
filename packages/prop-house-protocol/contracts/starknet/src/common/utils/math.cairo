// Raise a number to a power.
/// * `base` - The number to raise.
/// * `exp` - The exponent.
fn pow(base: usize, mut exp: usize) -> usize {
    if exp == 0 {
        1
    } else {
        base * pow(base, exp - 1)
    }
}
