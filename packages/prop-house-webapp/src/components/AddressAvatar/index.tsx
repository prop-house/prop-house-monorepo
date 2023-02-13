import React from 'react';
import classes from './AddressAvatar.module.css';
import { useEnsAvatar } from 'wagmi';
import type { GlassesParts, GlassesBgColors } from '../../utils/getNoggles';
import { Factory } from '@cloudnouns/factory';
import NogglesData from './noggles.json';
import clsx from 'clsx';

const AddressAvatar: React.FC<{ address: string; size?: number }> = props => {
  const { address, size: s = 24 } = props;

  const { data: avatar } = useEnsAvatar({ address: address as `0x${string}` });

  const factory = new Factory<GlassesParts, GlassesBgColors>(NogglesData);
  const generateGlasses = () => factory.createItem();
  const glasses = generateGlasses().dataUrl;

  const size = s + 'px';

  return (
    <div className={clsx(classes.container, 'avatar')}>
      <img
        style={{ height: size, width: size }}
        className={clsx(!avatar && classes.glasses)}
        src={avatar ? avatar : glasses}
        alt=""
      />
    </div>
  );
};

export default AddressAvatar;
