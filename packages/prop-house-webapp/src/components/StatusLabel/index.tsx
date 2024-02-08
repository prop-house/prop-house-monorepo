import clsx from 'clsx';
import classes from './StatusLabel.module.css';
import { Timed } from '@prophouse/sdk-react';

const StatusLabel: React.FC<{ state: Timed.RoundState }> = props => {
  const { state } = props;

  let copy = '';
  let bgClass = '';

  switch (state) {
    case Timed.RoundState.UNKNOWN:
      copy = 'Unknown';
      bgClass = classes.grayBg;
      break;
    case Timed.RoundState.CANCELLED:
      copy = 'Cancelled';
      bgClass = classes.redBg;
      break;
    case Timed.RoundState.NOT_STARTED:
      copy = 'Not Started';
      bgClass = classes.yellowBg;
      break;
    case Timed.RoundState.IN_PROPOSING_PERIOD:
      copy = 'In Proposing Period';
      bgClass = classes.greenBg;
      break;
    case Timed.RoundState.IN_VOTING_PERIOD:
      copy = 'In Voting Period';
      bgClass = classes.blueBg;
      break;
    case Timed.RoundState.IN_CLAIMING_PERIOD:
      copy = 'In Claiming Period';
      bgClass = classes.purpleBg;
      break;
    case Timed.RoundState.COMPLETE:
      copy = 'Complete';
      bgClass = classes.indigoBg;
      break;
    default:
      copy = 'Unknown';
      bgClass = classes.grayBg;
      break;
  }

  return <span className={clsx(classes.pillContainer, bgClass)}>{copy}</span>;
};

export default StatusLabel;
