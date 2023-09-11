import { utils } from 'ethers';

export const asciiToHex = (s: string) => utils.hexlify(utils.toUtf8Bytes(s));
