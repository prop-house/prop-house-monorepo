import classes from './Button.module.css';
import clsx from 'clsx';
import { Button as BSButton } from 'react-bootstrap';

export enum ButtonColor {
  Pink,
  White,
  Yellow,
}
const Button: React.FC<{
  text: string;
  bgColor: ButtonColor;
  disabled?: boolean;
  onClick?: () => void;
  classNames?: string[] | string;
}> = (props) => {
  const { text, bgColor, disabled, onClick, classNames } = props;

  return (
    <BSButton
      className={clsx(
        classes.btn,
        bgColor === ButtonColor.Pink
          ? classes.btnPinkBg
          : bgColor === ButtonColor.White
          ? classes.btnWhiteBg
          : classes.btnYellowBg,
        classNames
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </BSButton>
  );
};

export default Button;
