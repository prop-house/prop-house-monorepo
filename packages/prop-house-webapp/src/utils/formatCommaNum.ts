/**
 * this will format a number with commas for currency display
 * @param num the amount to format
 * @returns a number that will be formatted with commas if applicable and decimals if not a whole number
 *
 * @see - different than TruncateThousands because we don't want to truncate
 *
 * ex. 1320 => 1,320
 * ex. 6.0239 => 6.02
 */

export const formatCommaNum = (num: number, decimals: number = 2): string => {
  const isWholeNumber = num % 1 === 0; // Check if input number is a whole number

  // Set decimals to 0 if the input number is a whole number, else set it to 2
  decimals = isWholeNumber ? 0 : decimals;

  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
