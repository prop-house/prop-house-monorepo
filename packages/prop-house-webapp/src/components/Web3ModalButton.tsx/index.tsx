import React, { useEffect } from 'react';
import { useEthers, shortenAddress, useLookupAddress } from '@usedapp/core';
import { web3Modal } from '../../utils/web3Modal';
import classes from './Web3ModalButton.module.css';
import clsx from 'clsx';

const Web3ModalButton: React.FC<{
  classNames?: string | string[];
}> = (props) => {
  const { classNames } = props;
  const { account, activate, deactivate, error } = useEthers();
  const ens = useLookupAddress();

  useEffect(() => {
    if (error) {
      console.log('error!: ', error);
    }
  }, [error]);

  const activateProvider = async () => {
    try {
      const provider = await web3Modal.connect();
      await activate(provider);
    } catch (error: any) {
      console.log(error);
    }
  };

  return (
    <div className={classes.wrapper}>
      {account ? (
        <>
          <div className={clsx(classNames)}>
            {ens ?? shortenAddress(account)}
          </div>
          <div className={clsx(classNames)} onClick={() => deactivate()}>
            Disconnect
          </div>
        </>
      ) : (
        <div className={clsx(classNames)} onClick={activateProvider}>
          Connect
        </div>
      )}
    </div>
  );
};
export default Web3ModalButton;
