import classes from './Button.module.css';
import clsx from 'clsx';
import { Button as BSButton } from 'react-bootstrap';

export enum ButtonColor {
  Pink,
  White,
  Yellow,
  WhiteYellow,
  Green,
  Purple,
  Gray,
}
const Button: React.FC<{
  text: string;
  bgColor: ButtonColor;
  disabled?: boolean;
  onClick?: (e: any) => void;
  classNames?: string[] | string;
}> = props => {
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
      : bgColor === ButtonColor.Gray
      ? classes.btnGrayBg
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
