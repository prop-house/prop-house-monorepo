import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { MdInfoOutline } from 'react-icons/md';
import Tooltip from '../Tooltip';
import classes from './RoundUtilBarItem.module.css';

export const RoundUtilBarItem: React.FC<{
  title: string;
  content: string | ReactNode;
}> = props => {
  const { title, content } = props;

  return (
    <div className={classes.item}>
      <div className={classes.itemTitle}>{title}</div>
      <div className={classes.itemData}>{content}</div>
    </div>
  );
};

export const RoundUtilBarItemTooltip: React.FC<{
  title: string | ReactNode;
  content: string | ReactNode;
  tooltipContent: string;
  titleColor?: 'gray' | 'purple';
  lastItem?: boolean;
}> = props => {
  const { title, content, tooltipContent, titleColor } = props;

  return (
    <div className={classes.item}>
      <Tooltip
        content={
          <>
            <div className={clsx(classes.itemTitle, titleColor === 'purple' && classes.purpleText)}>
              {title}
              <span className="infoSymbol">
                <MdInfoOutline />
              </span>
            </div>
            <div className={classes.itemData}>{content}</div>
          </>
        }
        tooltipContent={tooltipContent}
      />
    </div>
  );
};

export const RoundUtilBarItemBalance: React.FC<{
  content: string | ReactNode;
  progress: number;
}> = props => {
  const { content, progress } = props;
  return (
    <div className={clsx(classes.item, classes.displayProgBar)}>
      <div>
        <div className={classes.itemTitle}>Balance</div>
        <div className={classes.itemData}>{content}</div>
      </div>
      <div className={classes.progressBar}>
        <div className={classes.progress} style={{ height: `${progress}%` }}></div>
      </div>
    </div>
  );
};
