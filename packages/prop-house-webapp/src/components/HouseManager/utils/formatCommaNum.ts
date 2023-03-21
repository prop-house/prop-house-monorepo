// Description: Format number with comma to two decimal places
export const formatCommaNum = (num: number): string => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
