import classes from './TimePeriodSelector.module.css';
import React, { Dispatch, ReactNode, SetStateAction } from 'react';

const TimePeriodSelector: React.FC<{
  children: ReactNode;
  setSelectedOption?: Dispatch<SetStateAction<number>>;
}> = props => {
  const { children } = props;

  return <div className={classes.container}>{children}</div>;
};

export default TimePeriodSelector;
