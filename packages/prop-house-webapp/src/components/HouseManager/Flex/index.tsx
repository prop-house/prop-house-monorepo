import clsx from 'clsx';
import classes from './Flex.module.css';

const Flex: React.FC<{
  children: React.ReactNode;
  column?: boolean;
}> = props => {
  const { children, column } = props;

  return <div className={clsx(classes.row, column && classes.column)}>{children}</div>;
};

export default Flex;
