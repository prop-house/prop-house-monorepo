import classes from './DateTimeInput.module.css';
import 'react-datetime/css/react-datetime.css';
import DateTime from 'react-datetime';
import clsx from 'clsx';

const DateTimeInput: React.FC<{
  selectedDate: Date | string;
  onDateChange: any;
  // isValidDate: any;
}> = props => {
  const {
    selectedDate,
    onDateChange,
    // isValidDate
  } = props;

  // when the date is not selected, it is a string vs a date object
  const placeholder = typeof selectedDate === 'string';

  return (
    // placeholder class makes the text gray
    <div className={clsx(classes.container, placeholder && classes.placeholder)}>
      <DateTime
        value={selectedDate}
        onChange={onDateChange}
        //  isValidDate={isValidDate}
      />
    </div>
  );
};

export default DateTimeInput;
