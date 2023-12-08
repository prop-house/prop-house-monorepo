import classes from './CardWrapper.module.css';
import { ReactNode } from 'react';

const CardWrapper: React.FC<{
  children: ReactNode;
}> = props => {
  const { children } = props;

  return <div className={classes.container}>{children}</div>;
};

export default CardWrapper;
