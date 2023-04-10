import clsx from 'clsx';
import classes from './StatusLabel.module.css';
import { RoundState } from '../HouseManager/Rounds';

const StatusLabel: React.FC<{ state: RoundState }> = props => {
  const { state } = props;

  let copy = '';
  let bgClass = '';

  switch (state) {
    case RoundState.AwaitingRegistration:
      copy = 'Awaiting Registration';
      bgClass = classes.grayBg;
      break;
    case RoundState.Cancelled:
      copy = 'Cancelled';
      bgClass = classes.greenBg;
      break;
    case RoundState.Finalized:
      copy = 'Finalized';
      bgClass = classes.purpleBg;
      break;
    case RoundState.Registered:
      copy = 'Registered';
      bgClass = classes.whiteBg;
      break;
    default:
      copy = 'Unknown';
      bgClass = classes.grayBg;
      break;
  }

  return <span className={clsx(classes.pillContainer, bgClass)}>{copy}</span>;
};

export default StatusLabel;
