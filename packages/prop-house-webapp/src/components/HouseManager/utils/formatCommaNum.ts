export const formatCommaNum = (num: number): string => {
  const isWholeNumber = num % 1 === 0; // Check if input number is a whole number

  // Set decimals to 0 if the input number is a whole number, else set it to 2
  const decimals = isWholeNumber ? 0 : 2;

  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
