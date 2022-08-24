import { ERC721Strategy } from '../types';

export const erc721Base = (contractAddress: string): ERC721Strategy => {
  return {
    name: 'erc721',
    params: {
      address: contractAddress,
      symbol: '',
    },
  };
};
