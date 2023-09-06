import clsx from 'clsx';
import React from 'react';
import { useAppSelector } from '../../hooks';
import trimEthAddress from '../../utils/trimEthAddress';
import classes from './EthAddress.module.css';
import { useEnsName } from 'wagmi';
import Avatar from '../Avatar';

const EthAddress: React.FC<{
  address: string;
  imgSrc?: string;
  className?: string;
  addAvatar?: boolean;
  avatarSize?: number;
}> = props => {
  const { address, imgSrc, className, addAvatar, avatarSize } = props;

  // create Etherscan link
  const etherscanHost = useAppSelector(state => state.configuration.etherscanHost);
  const buildAddressHref = (address: string) => [etherscanHost, 'address', address].join('/');

  // wagmi hooks to get ENS name and avatar
  const { data: ens } = useEnsName({ address: address as `0x${string}` });

  // trim address: 0x1234567890abcdef1234567890abcdef12345678 -> 0x1234...5678
  const shortAddress = trimEthAddress(address as string);

  return (
    <div onClick={(e: any) => e.stopPropagation()} className={clsx(classes.ethAddress)}>
      <a href={buildAddressHref(address)} target="_blank" rel="noreferrer">
        {imgSrc ? (
          <img src={imgSrc} className={classes.img} alt="avatar" />
        ) : (
          addAvatar && <Avatar address={address} diameter={avatarSize ? avatarSize : 20} />
        )}
        <span className={clsx(classes.address, className)}>{ens ? ens : shortAddress}</span>
      </a>
    </div>
  );
};

export default EthAddress;
