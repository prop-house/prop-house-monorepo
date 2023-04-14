import classes from './NumberOfWinners.module.css';
import React from 'react';
import Button, { ButtonColor } from '../../Button';
import Group from '../Group';
import Text from '../Text';

const NumberOfWinners: React.FC<{
  editMode?: boolean;
  winners: number;
  disabled: boolean;
  handleNumWinnersChange: (amount: number) => void;
}> = props => {
  const { editMode, winners, handleNumWinnersChange, disabled } = props;

  const handleIncrement = () => handleNumWinnersChange(winners + 1);
  const handleDecrement = () => handleNumWinnersChange(winners - 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // use ParseInt to convert string to number and disallow decimals
    let value = parseInt(e.target.value);
    // If value is NaN or negative, set to 1
    if (isNaN(value) || value < 1) value = 1;

    handleNumWinnersChange(value);
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clipboardData = e.clipboardData.getData('text');
    // use ParseInt to convert string to number and disallow decimals
    const value = parseInt(clipboardData, 10);
    if (isNaN(value) || value < 1) {
      // disallow paste if value is not a number or 0
      e.preventDefault();
      return;
    }
  };

  return (
    <Group gap={4}>
      <Text type="subtitle">Number of winner(s)</Text>

      <Group row gap={editMode ? 6 : 16} classNames={classes.inputContainer}>
        <input
          className={classes.votesInput}
          disabled={disabled}
          value={disabled ? '' : winners}
          placeholder="1"
          type="number"
          onChange={handleInputChange}
          onPaste={handleInputPaste}
        />

        <div className={classes.allotButtons}>
          <Button
            text="-"
            classNames={classes.button}
            bgColor={ButtonColor.Gray}
            onClick={handleDecrement}
            disabled={winners === 1 || disabled}
          />
          <Button
            text="+"
            disabled={disabled}
            classNames={classes.button}
            bgColor={ButtonColor.Gray}
            onClick={handleIncrement}
          />
        </div>
      </Group>
    </Group>
  );
};

export default NumberOfWinners;
