import NounPunksABI from './abi/NounPunks.json';

interface Contract {
  name: string;
  address: string;
  abi: {};
}

export const contracts: Contract[] = [
  {
    name: 'NounPunks',
    address: '0xE169c2ED585e62B1d32615BF2591093A629549b6',
    abi: NounPunksABI,
  },
];
