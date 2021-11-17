import clsx from 'clsx';
import classes from './Card.module.css';

export enum CardBgColor {
  Light,
  Dark,
}

export enum CardBorderRadius {
  twenty,
  thirty,
}

const Card: React.FC<{ bgColor: CardBgColor; borderRadius: CardBorderRadius }> =
  (props) => {
    const _classes = clsx(
      classes.card,
      props.bgColor === CardBgColor.Light ? classes.lightBg : classes.darkBg,
      props.borderRadius === CardBorderRadius.twenty
        ? classes.borderRadius20
        : classes.borderRadius30
    );
    return <div className={_classes}>{props.children}</div>;
  };

export default Card;
