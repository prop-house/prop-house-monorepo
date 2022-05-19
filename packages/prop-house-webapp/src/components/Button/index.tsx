import classes from './Button.module.css';
import clsx from 'clsx';
import { Button as BSButton } from 'react-bootstrap';

export enum ButtonColor {
  Pink,
  White,
  Yellow,
  WhiteYellow,
  Green,
  Purple
}
const Button: React.FC<{
  text: string;
  bgColor: ButtonColor;
  disabled?: boolean;
  onClick?: () => void;
  classNames?: string[] | string;
}> = (props) => {
  const { text, bgColor, disabled, onClick, classNames } = props;

  const bgColorClass =
    bgColor === ButtonColor.Pink
      ? classes.btnPinkBg 
      : bgColor === ButtonColor.Purple
      ? classes.btnPurpleBg
      : bgColor === ButtonColor.White
      ? classes.btnWhiteBg
      : bgColor === ButtonColor.Yellow
      ? classes.btnYellowBg
      : bgColor === ButtonColor.Green
      ? classes.btnGreenBg
      : classes.btnWhiteYellowBg;

  return (
    <BSButton
      className={clsx(classes.btn, bgColorClass, classNames)}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </BSButton>
  );
};

export default Button;
