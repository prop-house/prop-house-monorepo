import { RoundState } from '@prophouse/sdk-react';
import clsx from 'clsx';
import classes from './StatusPill.module.css';

const StatusPill: React.FC<{ status: RoundState }> = props => {
  const { status } = props;

  let copy = '';
  let bgClass = '';

  switch (status) {
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

export default StatusPill;
