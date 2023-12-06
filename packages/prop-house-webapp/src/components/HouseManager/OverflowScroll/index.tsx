import classes from './OverflowScroll.module.css';
import { ReactNode } from 'react';

interface OverflowScrollProps {
  children: ReactNode;
  height?: number;
}

const OverflowScroll: React.FC<OverflowScrollProps> = ({ children, height = 390 }) => {
  return (
    <div className={classes.container} style={{ maxHeight: `${height}px` }}>
      {children}
    </div>
  );
};

export default OverflowScroll;
