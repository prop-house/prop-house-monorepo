export const invalidAddressChar = (value: string) => {
  const isInvalid = /[^a-zA-Z0-9]/.test(value);
  return isInvalid;
};
