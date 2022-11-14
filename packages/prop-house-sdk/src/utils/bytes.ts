export const hexToBytes = (hex: string): number[] => {
  const bytes: number[] = [];
  for (let c = 2; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substring(c, c + 2), 16));
  }
  return bytes;
};

export const bytesToHex = (bytes: number[] | Uint8Array): string => {
  const body = Array.from(bytes, function (byte) {
    return `0${(byte & 0xff).toString(16)}`.slice(-2);
  }).join('');
  return `0x${body}`;
};
