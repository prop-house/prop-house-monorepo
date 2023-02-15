import classes from './NumberInput.module.css';
import clsx from 'clsx';
import { Dispatch, SetStateAction } from 'react';

const NumberInput: React.FC<{
  placeholder: string;
  value: string | number;
  maxDigits?: number;
  classNames?: string;
  note?: string;
  setValue: Dispatch<SetStateAction<any>>;
  disabled?: boolean;
  focus?: boolean;
  setNumberError: Dispatch<SetStateAction<boolean>>;
  resetVotingPeriod?: () => void;
}> = props => {
  const {
    placeholder,
    maxDigits = 2,
    value,
    focus,
    setValue,
    disabled,
    setNumberError,
    classNames,
    resetVotingPeriod,
  } = props;

  return (
    <div className={clsx(classes.inputContainer, classNames)}>
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        autoFocus={focus}
        disabled={disabled}
        onChange={e => {
          const input = Number(e.target.value);
          if (input < 0) {
            e.preventDefault();
            setNumberError(true);
          } else if (input === 0 && resetVotingPeriod) {
            console.log('resetting voting period!');
            resetVotingPeriod();
          } else {
            setValue(input);
            setNumberError(false);
          }
        }}
        maxLength={maxDigits}
      />
    </div>
  );
};

export default NumberInput;
