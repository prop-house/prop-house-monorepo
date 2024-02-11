import clsx from 'clsx';
import React from 'react';
import trimEthAddress from '../../utils/trimEthAddress';
import classes from './EthAddress.module.css';
import { useEnsName } from 'wagmi';
import Avatar from '../Avatar';
import buildEtherscanPath from '../../utils/buildEtherscanPath';

const EthAddress: React.FC<{
  address: string;
  imgSrc?: string;
  className?: string;
  addAvatar?: boolean;
  avatarSize?: number;
}> = props => {
  const { address, imgSrc, className, addAvatar, avatarSize } = props;

  const { data: ens } = useEnsName({ address: address as `0x${string}` });
  const shortAddress = trimEthAddress(address as string);

  return (
    <div onClick={(e: any) => e.stopPropagation()} className={clsx(classes.ethAddress)}>
      <a href={buildEtherscanPath(address)} target="_blank" rel="noreferrer">
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
