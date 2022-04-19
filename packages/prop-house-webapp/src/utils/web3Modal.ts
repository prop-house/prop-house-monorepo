import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

export const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      infuraId: '0be66e03abae4c0583466f8bc3d003a4', // required
    },
  },
};

export const web3Modal = new Web3Modal({
  network: 'mainnet', // optional
  providerOptions, // required
});
