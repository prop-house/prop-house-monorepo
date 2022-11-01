import clsx from 'clsx';
import { Dispatch, SetStateAction } from 'react';
import classes from './Input.module.css';

const Input: React.FC<{
  title: string;
  type: 'text' | 'number';
  placeholder: string;
  value: string | number;
  row?: boolean;
  onChange: Dispatch<SetStateAction<any>>;
  classNames?: string;
  note?: string;
}> = props => {
  const { title, type, placeholder, value, row, onChange, classNames, note } = props;

  return (
    <div
      className={clsx(
        classes.inputContainer,
        row && classes.rowLayout,
        type === 'number' && classes.numberInput,
      )}
    >
      <p className={classes.inputTitle}>{title}</p>
      <input
        className={classNames}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {note && <span className={classes.inputNote}>{note}</span>}
    </div>
  );
};

export default Input;
