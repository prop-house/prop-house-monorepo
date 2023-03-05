import classes from './DateTimeInput.module.css';
import 'react-datetime/css/react-datetime.css';
import DateTime from 'react-datetime';
import { Dayjs } from 'dayjs';
import moment from 'moment';

const DateTimeInput: React.FC<{
  selectedDate: any;
  onDateChange: any;
  isValidDate: (current: Dayjs) => boolean;
}> = props => {
  const { selectedDate, onDateChange, isValidDate } = props;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' || event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    // placeholder class makes the text gray
    <div onKeyDown={handleKeyDown} className={classes.container}>
      <DateTime
        value={selectedDate}
        initialValue={selectedDate ? moment(selectedDate) : 'mm/dd/yyyy, --:--'}
        inputProps={{ className: selectedDate ? '' : classes.placeholder }}
        onChange={onDateChange}
        closeOnSelect
        isValidDate={isValidDate}
      />
    </div>
  );
};

export default DateTimeInput;
