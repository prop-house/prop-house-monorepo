import Button, { ButtonColor } from '../../Button';
import classes from './XButton.module.css';

const XButton = () => {
  return (
    <>
      <Button
        text="X"
        classNames={classes.xButton}
        bgColor={ButtonColor.White}
        onClick={() => {}}
      />
    </>
  );
};

export default XButton;
