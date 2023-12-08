import { ChainId } from '@prophouse/sdk-react';

export const getBlockExplorerURL = (chainId: number, txHash: string) => {
  if (chainId !== ChainId.EthereumMainnet) {
    return `https://testnet.starkscan.co/tx/${txHash}`;
  }
  return `https://starkscan.co/tx/${txHash}`;
};
