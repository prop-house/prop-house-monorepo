import React from 'react';
import { useEthers, shortenAddress, useLookupAddress } from '@usedapp/core';
import classes from './Web3ModalButton.module.css';
import useWeb3Modal from '../../hooks/useWeb3Modal';
import clsx from 'clsx';
import { useAppDispatch } from '../../hooks';
import { setDelegatedVotes } from '../../state/slices/propHouse';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';

const Web3ModalButton: React.FC<{
  classNames?: string | string[];
}> = props => {
  const { classNames } = props;
  const { account, deactivate } = useEthers();
  const connect = useWeb3Modal();
  const ens = useLookupAddress();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  return (
    <div className={classes.wrapper}>
      {account ? (
        <>
          <div className={clsx(classNames)}>{ens ?? shortenAddress(account)}</div>
          <div
            className={clsx(classNames)}
            onClick={() => {
              dispatch(setDelegatedVotes(undefined));
              deactivate();
            }}
          >
            {t('disconnect')}
          </div>
        </>
      ) : (
        <Button
          bgColor={ButtonColor.Purple}
          text={t('connect')}
          onClick={connect}
          classNames={clsx(classes.btn, classes.connectBtn)}
        />
      )}
    </div>
  );
};
export default Web3ModalButton;
