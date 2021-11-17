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

const Card: React.FC<{ bgColor: CardBgColor; borderRadius: CardBorderRadius }> =
  (props) => {
    const _classes = clsx(
      classes.card,
      props.bgColor === CardBgColor.LightPurple
        ? classes.lightPurpleBg
        : props.bgColor === CardBgColor.DarkPurple
        ? classes.darkPurpleBg
        : classes.whiteBg,
      props.borderRadius === CardBorderRadius.twenty
        ? classes.borderRadius20
        : classes.borderRadius30
    );
    return <div className={_classes}>{props.children}</div>;
  };

export default Card;
