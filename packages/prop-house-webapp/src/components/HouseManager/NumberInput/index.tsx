import classes from './NumberInput.module.css';
import clsx from 'clsx';
import { Dispatch, SetStateAction } from 'react';

const NumberInput: React.FC<{
  placeholder?: string;
  value: number;
  maxDigits?: number;
  classNames?: string;
  note?: string;
  setValue: Dispatch<SetStateAction<any>>;
  disabled?: boolean;
}> = props => {
  const { placeholder, maxDigits = 2, value, setValue, disabled, classNames } = props;

  return (
    <div className={clsx(classes.inputContainer, classNames)}>
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={e => {
          const input = Number(e.target.value);
          if (input <= 0 || isNaN(input) || !Number.isInteger(input)) {
            e.preventDefault();
          } else {
            setValue(input);
          }
        }}
        maxLength={maxDigits}
      />
    </div>
  );
};

export default NumberInput;
