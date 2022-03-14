import NounPunksABI from './abi/NounPunks.json';
import SideNounABI from './abi/SideNoun.json';

interface Contract {
  address: string;
  abi: any;
}

export const contracts: Contract[] = [
  {
    address: '0xE169c2ED585e62B1d32615BF2591093A629549b6',
    abi: NounPunksABI,
  },
  {
    address: '0xd9E49f550d0F605e3cCEE3167eC14ee7a9134DdB',
    abi: SideNounABI,
  },
];
