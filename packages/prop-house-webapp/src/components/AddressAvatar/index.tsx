import React from 'react';
import classes from './AddressAvatar.module.css';
import { useEnsAvatar } from 'wagmi';
// import { Noun } from '@cloudnouns/kit';
// const noun = new Noun({ traits: { head: 'n', accessory: 'n', background: 'n' } });

const AddressAvatar: React.FC<{ address: string; size: number }> = props => {
  const { address, size } = props;
  const { data: avatar } = useEnsAvatar({ address: address as `0x${string}` });

  return (
    <img
      style={{ height: size || 100, width: size || 100 }}
      className={classes.avatar}
      src={avatar ? avatar : 'noun'}
      alt="avatar"
    />
  );
};

export default AddressAvatar;
