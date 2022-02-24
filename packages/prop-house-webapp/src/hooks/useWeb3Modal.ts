import { useEthers } from '@usedapp/core';
import { web3Modal } from '../utils/web3Modal';

const useWeb3Modal = () => {
  const { activate } = useEthers();

  const activateProvider = async () => {
    try {
      const provider = await web3Modal.connect();
      await activate(provider);
    } catch (error: any) {
      // handle error
      console.log(error);
    }
  };
  return activateProvider;
};

export default useWeb3Modal;
