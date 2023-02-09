import clsx from 'clsx';
import { Dispatch, SetStateAction } from 'react';
import classes from './Input.module.css';

const Input: React.FC<{
  type?: 'input' | 'textarea';
  inputType?: 'text' | 'number' | 'date';
  placeholder: string;
  value: string | number;
  row?: boolean;
  onChange: Dispatch<SetStateAction<any>>;
  classNames?: string;
  note?: string;
}> = props => {
  const {
    type = 'input',
    inputType = 'text',
    placeholder,
    value,
    row,
    onChange,
    classNames,
    note,
  } = props;

  return (
    <div
      className={clsx(
        classes.inputContainer,
        row && classes.rowLayout,
        inputType === 'number' && classes.numberInput,
      )}
    >
      {type === 'input' ? (
        <input
          className={classNames}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      ) : (
        <textarea
          className={classNames}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}

      {note && <span className={classes.inputNote}>{note}</span>}
    </div>
  );
};

export default Input;
