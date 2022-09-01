import dayjs from 'dayjs';
import classes from './RoundMessage.module.css';

interface RoundMessageProps {
  message: string;
  date?: Date;
}

const RoundMessage = ({ message, date }: RoundMessageProps) => {
  return (
    <div className={classes.noResultsContainer}>
      <div className={classes.cardImage}>
        <img src="/doom.png" alt="cards" />
      </div>

      <div className={classes.textContainer}>
        <div className={classes.message}>{message}</div>
        {date && (
          <div className={classes.date}>
            {' '}
            {dayjs(date).format('MMMM D')} at {dayjs(date).tz().format('h:mm A z')}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundMessage;
