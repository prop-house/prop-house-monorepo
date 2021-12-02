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
  onClick?: () => void;
}> = (props) => {
  const { text, bgColor, disabled, onClick } = props;

  return (
    <BSButton
      className={clsx(
        classes.btn,
        bgColor === ButtonColor.Pink ? classes.btnPinkBg : classes.btnWhiteBg
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </BSButton>
  );
};

export default Button;
