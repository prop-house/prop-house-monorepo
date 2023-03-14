export const countDecimals = (num: number): number => {
  const parts = num.toString().split('.');
  return parts.length === 2 ? parts[1].length : 0;
};
