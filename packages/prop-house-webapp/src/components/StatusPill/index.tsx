import clsx from 'clsx';
import classes from './StatusPill.module.css';

export enum StatusPillColor {
  Gray,
  Green,
  Purple,
}

const StatusPill: React.FC<{ copy: string; color: StatusPillColor }> = props => {
  const { copy, color } = props;

  let bgClass = '';

  switch (color) {
    case StatusPillColor.Gray:
      bgClass = classes.grayBg;
      break;
    case StatusPillColor.Green:
      bgClass = classes.greenBg;
      break;
    case StatusPillColor.Purple:
      bgClass = classes.purpleBg;
      break;
  }

  return <span className={clsx(classes.pillContainer, bgClass)}>{copy}</span>;
};

export default StatusPill;
