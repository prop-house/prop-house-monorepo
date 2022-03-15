import NounPunksABI from './abi/NounPunks.json';
import SideNounABI from './abi/SideNoun.json';
import LostNounsABI from './abi/LostNouns.json';

interface Contract {
  address: string;
  abi: any;
}

export const contracts: Contract[] = [
  {
    address: '0x2605afbb22c59296c16ef5e477110357f760b20f',
    abi: LostNounsABI,
  },
  {
    address: '0xE169c2ED585e62B1d32615BF2591093A629549b6',
    abi: NounPunksABI,
  },
  {
    address: '0xd9E49f550d0F605e3cCEE3167eC14ee7a9134DdB',
    abi: SideNounABI,
  },
];
