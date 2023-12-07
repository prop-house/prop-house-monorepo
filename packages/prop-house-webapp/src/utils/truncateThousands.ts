export const truncateThousands = (amount: number, decimals?: number) => {
  const addDecimals = (amount: number) =>
    decimals
      ? amount % 1 !== 0
        ? Number(amount).toFixed(decimals)
        : amount
      : Number(amount).toFixed(0);

  return `${addDecimals(amount >= 1000 ? amount / 1000 : amount)}${amount >= 1000 && 'K'} `;
};
