import { RoundType, getContractAddressesForChainOrThrow } from '@prophouse/sdk';
import { getAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import fetch from 'node-fetch-commonjs';
import { TransactionStatus, Uint256 } from './types';
import { FullBlock } from 'checkpoint-beta';

const {
  starknet: { classHashes },
} = getContractAddressesForChainOrThrow(parseInt(process.env.SOURCE_CHAIN_ID!));

export const CLASS_HASH_TO_ROUND_TYPE = {
  [classHashes.timedFunding]: RoundType.TIMED_FUNDING,
};

export const getRoundType = (hash: string) => {
  if (!CLASS_HASH_TO_ROUND_TYPE[hash]) {
    throw new Error(`Unknown class hash: ${hash}`);
  }
  return CLASS_HASH_TO_ROUND_TYPE[hash];
};

export const shortStringToStr = (shortStringArr: bigint): string => {
  let res = '';
  const hexForm = shortStringArr.toString(16);
  const chunkSize = 2;
  if (hexForm.length % chunkSize !== 0) throw new Error('Parsing failed');
  for (let i = 0; i < hexForm.length; i += chunkSize) {
    const s = parseInt(hexForm.slice(i, i + chunkSize), 16);
    res += String.fromCharCode(s);
  }
  return res;
};

export const shortStringArrToStr = (shortStringArr: bigint[]): string => {
  let res = '';
  for (const shortStr of shortStringArr) {
    res += shortStringToStr(shortStr);
  }
  return res;
};

export const intSequenceToString = (intSequence: bigint[]): string => {
  const sequenceStr = shortStringArrToStr(intSequence);
  return (sequenceStr.split(/(.{9})/) || [])
    .filter(str => str !== '')
    .map(str => str.replace('\x00', '').split('').reverse().join(''))
    .join('');
};

export const uint256toString = (uint256: Uint256): string => {
  return (BigInt(uint256.low) + (BigInt(uint256.high) << BigInt(128))).toString();
};

export const toAddress = (bn: BigNumber) => {
  try {
    return getAddress(BigNumber.from(bn).toHexString());
  } catch {
    return bn;
  }
};

export const getUrl = (uri: string, gateway = 'pineapple.fyi') => {
  const ipfsGateway = `https://${gateway}`;
  if (!uri) return null;
  if (
    !uri.startsWith('ipfs://') &&
    !uri.startsWith('ipns://') &&
    !uri.startsWith('https://') &&
    !uri.startsWith('http://')
  )
    return `${ipfsGateway}/ipfs/${uri}`;

  const uriScheme = uri.split('://')[0];
  if (uriScheme === 'ipfs') return uri.replace('ipfs://', `${ipfsGateway}/ipfs/`);
  if (uriScheme === 'ipns') return uri.replace('ipns://', `${ipfsGateway}/ipns/`);
  return uri;
};

export const getJSON = async (uri: string): Promise<any> => {
  const url = getUrl(uri);
  if (url) {
    const res = await fetch(url);
    return res.json();
  }
};

export const getTxStatus = (block: FullBlock | null) => {
  return block ? TransactionStatus.CONFIRMED : TransactionStatus.PENDING;
};

export const unixTimestamp = () => Math.floor(Date.now() / 1000);
