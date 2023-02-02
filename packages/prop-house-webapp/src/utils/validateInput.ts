/**
 * @description - Validates the input
 * @param min - Minimum character count
 * @param count - Current character count
 * @returns Boolean if the input is valid
 */

const validateInput = (min: number, count: number) => 0 < count && count < min;

export default validateInput;
