import { FC } from 'react';
import Button, { ButtonColor } from '../../Button';
import classes from './XButton.module.css';

const XButton: FC<{ handleClick: any; disabled: boolean }> = props => {
  const { handleClick, disabled } = props;
  return (
    <>
      <Button
        text="X"
        classNames={classes.xButton}
        bgColor={ButtonColor.White}
        onClick={handleClick}
        disabled={disabled}
      />
    </>
  );
};

export default XButton;
