import formatTime from '../../utils/formatTime';
import classes from './DeadlineDates.module.css';

const DeadlineDates: React.FC<{ start: string | Date; end: string | Date }> = props => {
  const { start, end } = props;

  return <div className={classes.date}>{`${formatTime(start)} - ${formatTime(end)}`}</div>;
};

export default DeadlineDates;
