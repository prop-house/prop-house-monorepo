import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { NewRound } from '../../state/slices/round';
import formatTime from '../../utils/formatTime';
import classes from './DeadlineDates.module.css';

const DeadlineDates: React.FC<{ round: StoredAuction | NewRound }> = props => {
  const { round } = props;

  return (
    <div className={classes.date}>
      {`${formatTime(round.startTime!)} - ${formatTime(round.votingEndTime!)}`}
    </div>
  );
};

export default DeadlineDates;
