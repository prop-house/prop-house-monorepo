import classes from './Button.module.css';
import clsx from 'clsx';
import { Button as BSButton } from 'react-bootstrap';
import ReactLoading from 'react-loading';

export enum ButtonColor {
  Pink,
  White,
  Yellow,
  WhiteYellow,
  Green,
  Purple,
  PurpleLight,
  Gray,
  Red,
}

export interface ButtonProps {
  text: string;
  bgColor: ButtonColor;
  disabled?: boolean;
  onClick?: (e: any) => void;
  classNames?: string[] | string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
  const { text, bgColor, disabled, onClick, classNames, loading } = props;
  const loadingSpinner = <ReactLoading type="spin" height={24} width={24} />;

  const bgColorClass =
    bgColor === ButtonColor.Pink
      ? classes.btnPinkBg
      : bgColor === ButtonColor.Purple
      ? classes.btnPurpleBg
      : bgColor === ButtonColor.PurpleLight
      ? classes.btnPurpleLightBg
      : bgColor === ButtonColor.White
      ? classes.btnWhiteBg
      : bgColor === ButtonColor.Yellow
      ? classes.btnYellowBg
      : bgColor === ButtonColor.Green
      ? classes.btnGreenBg
      : bgColor === ButtonColor.Red
      ? classes.btnRedBg
      : bgColor === ButtonColor.Gray
      ? classes.btnGrayBg
      : classes.btnWhiteYellowBg;

  return (
    <BSButton
      className={clsx(classes.btn, bgColorClass, classNames)}
      disabled={disabled}
      onClick={onClick}
    >
      {loading ? loadingSpinner : text}
    </BSButton>
  );
};

export default Button;
