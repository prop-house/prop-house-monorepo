import { ERC20BalanceOfStrategy } from '../types';

export const erc20Base = (contractAddress: string): ERC20BalanceOfStrategy => {
  return {
    name: 'erc20-balance-of',
    params: {
      address: contractAddress,
      symbol: '',
      decimals: 18,
    },
  };
};
