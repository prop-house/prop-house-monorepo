export const sanitizeAddress = (address: string) => {
  const needsSanitizing = address.length < 42;
  return needsSanitizing
    ? address.slice(0, 2) + '0'.repeat(42 - address.length) + address.slice(2)
    : address;
};
