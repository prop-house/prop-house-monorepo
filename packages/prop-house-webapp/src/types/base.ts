export const base = {
  id: 8453,
  network: 'base',
  name: 'Base',
  nativeCurrency: { name: 'Base', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://developer-access-mainnet.base.org'],
    },
    public: {
      http: ['https://developer-access-mainnet.base.org'],
    },
  },
  blockExplorers: {
    blockscout: {
      name: 'Basescout',
      url: 'https://base.blockscout.com',
    },
    default: {
      name: 'Basescan',
      url: 'https://basescan.org',
    },
    etherscan: {
      name: 'Basescan',
      url: 'https://basescan.org',
    },
  },
};
