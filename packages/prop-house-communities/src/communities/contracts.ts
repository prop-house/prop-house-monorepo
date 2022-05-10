import NounsABI from '../abi/Nouns.json';
import NounPunksABI from '../abi/NounPunks.json';
import { Contract } from './types';

export const contracts: Contract[] = [
  { address: '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03', abi: NounsABI },
  { address: '0xE169c2ED585e62B1d32615BF2591093A629549b6', abi: NounPunksABI },
];
