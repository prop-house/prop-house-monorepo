import NounPunksABI from './abi/NounPunks.json';
import NounCats from './abi/NounCats.json';

interface Contract {
  address: string;
  abi: any;
}

export const contracts: Contract[] = [
  {
    address: '0xE169c2ED585e62B1d32615BF2591093A629549b6',
    abi: NounPunksABI,
  },
  { address: '0xb5942db8d5be776ce7585132616d3707f40d46e5', abi: NounCats },
];
