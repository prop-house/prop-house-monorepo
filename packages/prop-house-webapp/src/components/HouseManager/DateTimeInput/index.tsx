import classes from './DateTimeInput.module.css';
import 'react-datetime/css/react-datetime.css';
import DateTime from 'react-datetime';

const DateTimeInput: React.FC<{
  selectedDate: Date | string;
  onDateChange: any;
  isValidDate: any;
}> = props => {
  const { selectedDate, onDateChange, isValidDate } = props;

  return (
    <div className={classes.container}>
      <DateTime value={selectedDate} onChange={onDateChange} isValidDate={isValidDate} />
    </div>
  );
};

export default DateTimeInput;
