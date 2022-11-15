import { getAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { shortStringArrToStr } from '@snapshot-labs/sx/dist/utils/strings';

export const toAddress = bn => {
  try {
    return getAddress(BigNumber.from(bn).toHexString());
  } catch (e) {
    return bn;
  }
};

export const hexStrArrToStr = (data, start: number, length: number | bigint): string => {
  const dataSlice = data.slice(start, start + Number(length));
  return shortStringArrToStr(dataSlice.map(m => BigInt(m)));
};
