import clsx from 'clsx';
import classes from './StatusPill.module.css';
import { ReactNode } from 'react';

export enum StatusPillColor {
  Gray,
  Green,
  Purple,
}

const StatusPill: React.FC<{
  copy: string | ReactNode;
  color: StatusPillColor;
  size?: number;
}> = props => {
  const { copy, color, size } = props;

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

  return (
    <span
      className={clsx(classes.pillContainer, bgClass)}
      style={{ fontSize: `${size ? size : 14}px` }}
    >
      {copy}
    </span>
  );
};

export default StatusPill;
