import { useConnectModal } from '@rainbow-me/rainbowkit';
import Button, { ButtonColor } from '../Button';
import classes from './ConnectToContinue.module.css';
import { TbPlugConnected } from 'react-icons/tb';

const ConnectToContinue = () => {
  const { openConnectModal } = useConnectModal();
  return (
    <div className={classes.notConnectedContainer}>
      <TbPlugConnected size={100} />
      <p>Please connect your account to continue</p>
      <Button text="Connect" bgColor={ButtonColor.Pink} onClick={openConnectModal} />
    </div>
  );
};
export default ConnectToContinue;
