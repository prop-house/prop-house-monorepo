import clsx from 'clsx';
import classes from './Card.module.css';

export enum CardBgColor {
  LightPurple,
  DarkPurple,
  White,
}

export enum CardBorderRadius {
  twenty,
  thirty,
}

const Card: React.FC<{
  bgColor: CardBgColor;
  borderRadius: CardBorderRadius;
  onHoverEffect?: boolean;
}> = (props) => {
  const { bgColor, borderRadius, onHoverEffect } = props;

  const _classes = clsx(
    classes.card,
    bgColor === CardBgColor.LightPurple
      ? classes.lightPurpleBg
      : bgColor === CardBgColor.DarkPurple
      ? classes.darkPurpleBg
      : classes.whiteBg,
    borderRadius === CardBorderRadius.twenty
      ? classes.borderRadius20
      : classes.borderRadius30,
    onHoverEffect && classes.onHoverEffect
  );
  return <div className={_classes}>{props.children}</div>;
};

export default Card;
