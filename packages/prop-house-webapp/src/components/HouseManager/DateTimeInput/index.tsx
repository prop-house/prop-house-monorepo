import classes from './DateTimeInput.module.css';
import 'react-datetime/css/react-datetime.css';
import DateTime from 'react-datetime';
import dayjs from 'dayjs';
import moment from 'moment';
import { useState } from 'react';

const DateTimeInput: React.FC<{
  selectedDate: any;
  onDateChange: any;
}> = props => {
  const { selectedDate, onDateChange } = props;

  const [timeConstraint, setTimeConstraint] = useState<{}>({});

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' || event.key === 'Enter') {
      event.preventDefault();
    }
  };

  const _onDateChange: any = (date: Date) => {
    onDateChange(date);

    if (dayjs(date).isSame(dayjs(), 'day')) {
      setTimeConstraint({
        hours: { min: dayjs().hour(), max: 24, step: 1 },
        minutes: { min: dayjs().minute(), max: 60, step: 1 },
      });
    } else {
      setTimeConstraint({});
    }
  };

  const _isValidDate = (current: Date) => {
    return dayjs(current).isAfter(dayjs().subtract(1, 'day'));
  };

  return (
    // placeholder class makes the text gray
    <div onKeyDown={handleKeyDown} className={classes.container}>
      <DateTime
        value={selectedDate}
        initialValue={selectedDate ? moment(selectedDate) : 'mm/dd/yyyy, --:--'}
        inputProps={{ className: selectedDate ? '' : classes.placeholder }}
        onChange={_onDateChange}
        closeOnSelect
        isValidDate={_isValidDate}
        timeConstraints={timeConstraint}
      />
    </div>
  );
};

export default DateTimeInput;
