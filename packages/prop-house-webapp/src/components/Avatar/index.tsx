import classes from './Avatar.module.css';
import { useEnsAvatar } from 'wagmi';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import { jsNumberForAddress } from 'react-jazzicon';
import useNnsName from '../../hooks/useNnsName';

const Avatar: React.FC<{ address: string; diameter: number }> = props => {
  const { address, diameter } = props;

  const { data: ensName } = useNnsName({
    address: address as `0x${string}`,
  });
  const { data: avatar } = useEnsAvatar({ name: ensName });

  return avatar ? (
    <img key={address} src={avatar} alt={`Avatar for ${address}`} className={classes.ensAvatar} />
  ) : (
    <Jazzicon diameter={diameter} seed={jsNumberForAddress(address)} />
  );
};

export default Avatar;
