import clsx from 'clsx';
import React from 'react';
import { useAppSelector } from '../../hooks';
import trimEthAddress from '../../utils/trimEthAddress';
import classes from './EthAddress.module.css';
import { useEnsName, useEnsAvatar } from 'wagmi';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

const EthAddress: React.FC<{ address: string; className?: string }> = props => {
  const { addressa, className } = props;
  const address = '0x1234567890abcdef1234567890abcdef12345678';
  // create Etherscan link
  const etherscanHost = useAppSelector(state => state.configuration.etherscanHost);
  const buildAddressHref = (address: string) => [etherscanHost, 'address', address].join('/');

  // wagmi hooks to get ENS name and avatar
  const { data: ens } = useEnsName({ address: address as any });
  const { data: avatar } = useEnsAvatar({ address: address as any });

  // trim address: 0x1234567890abcdef1234567890abcdef12345678 -> 0x1234...5678
  const shortAddress = trimEthAddress(address as string);

  return (
    <div onClick={(e: any) => e.stopPropagation()} className={classes.ethAddress}>
      <a href={buildAddressHref(address)} target="_blank" rel="noreferrer">
        {avatar ? (
          <img className={classes.avatar} src={avatar} alt="ens-avatar" />
        ) : (
          <Jazzicon diameter={20} seed={jsNumberForAddress(address)} />
        )}
        <span className={clsx(classes.address, className)}>{ens ? ens : shortAddress}</span>
      </a>
    </div>
  );
};

export default EthAddress;
