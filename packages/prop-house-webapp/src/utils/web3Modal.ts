import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

export const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: 'bb1bb1143055477dbe59879f4887516c', // required
    },
  },
};

export const web3Modal = new Web3Modal({
  network: 'mainnet', // optional
  providerOptions, // required
});
