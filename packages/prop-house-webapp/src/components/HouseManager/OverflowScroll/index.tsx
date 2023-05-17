import classes from './OverflowScroll.module.css';
import { ReactNode } from 'react';

const OverflowScroll: React.FC<{
  children: ReactNode;
}> = props => {
  const { children } = props;

  return <div className={classes.container}>{children}</div>;
};

export default OverflowScroll;
