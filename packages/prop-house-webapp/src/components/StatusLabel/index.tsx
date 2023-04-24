import { RoundState } from '@prophouse/sdk-react';
import classes from './StatusLabel.module.css';
import clsx from 'clsx';

// Why are there two identical components?
// `StatusPill` and `StatusLabel`

const StatusLabel: React.FC<{ state: RoundState }> = props => {
  const { state } = props;

  let copy = '';
  let bgClass = '';

  switch (state) {
    case RoundState.AWAITING_REGISTRATION:
      copy = 'Not configured';
      bgClass = classes.grayBg;
      break;
    case RoundState.NOT_STARTED:
      copy = 'Not started';
      bgClass = classes.grayBg;
      break;
    case RoundState.IN_PROPOSING_PERIOD:
      copy = 'Proposing';
      bgClass = classes.greenBg;
      break;
    case RoundState.IN_VOTING_PERIOD:
      copy = 'Voting';
      bgClass = classes.purpleBg;
      break;
    case RoundState.IN_CLAIMING_PERIOD:
      copy = 'Claiming';
      bgClass = classes.purpleBg;
      break;
    case RoundState.CANCELLED:
      copy = 'Cancelled';
      bgClass = classes.grayBg;
      break;
    case RoundState.COMPLETE:
      copy = 'Ended';
      bgClass = classes.grayBg;
      break;
    default:
      copy = 'Unknown';
      bgClass = classes.grayBg;
      break;
  }

  return <span className={clsx(classes.pillContainer, bgClass)}>{copy}</span>;
};

export default StatusLabel;
