import React from 'react';
import { useEthers, shortenAddress, useLookupAddress } from '@usedapp/core';
import classes from './Web3ModalButton.module.css';

import clsx from 'clsx';
import { useAppDispatch } from '../../hooks';
import { useTranslation } from 'react-i18next';
import { setVotingPower } from '../../state/slices/voting';
import ConnectButton from '../ConnectButton';

const Web3ModalButton: React.FC<{
  classNames?: string | string[];
}> = props => {
  const { classNames } = props;
  const { account, deactivate } = useEthers();
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
              dispatch(setVotingPower(0));
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
