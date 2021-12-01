import classes from './Button.module.css';
import clsx from 'clsx';
import { Button as BSButton } from 'react-bootstrap';

export enum ButtonColor {
  Pink,
  White,
}
const Button: React.FC<{
  text: string;
  bgColor: ButtonColor;
  disabled?: boolean;
}> = (props) => {
  const { text, bgColor, disabled } = props;

  return (
    <BSButton
      className={clsx(
        classes.btn,
        bgColor === ButtonColor.Pink ? classes.btnPinkBg : classes.btnWhiteBg
      )}
      disabled={disabled}
    >
      {text}
    </BSButton>
  );
};

export default Button;
