import classes from './Avatar.module.css';
import { useEnsAvatar } from 'wagmi';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import { jsNumberForAddress } from 'react-jazzicon';

const Avatar: React.FC<{ address: string; diameter: number }> = props => {
  const { address, diameter } = props;
  const { data } = useEnsAvatar({ name: `0x${address.substring(2)}` });

  return data ? (
    <img key={address} src={data} alt={`Avatar for ${address}`} className={classes.ensAvatar} />
  ) : (
    <Jazzicon diameter={diameter} seed={jsNumberForAddress(address)} />
  );
};

export default Avatar;
