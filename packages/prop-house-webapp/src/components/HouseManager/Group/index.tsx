import clsx from 'clsx';
import classes from './Group.module.css';

const Group: React.FC<{
  children: React.ReactNode;
  classNames?: string;
}> = props => {
  const { children, classNames } = props;

  return <div className={clsx(classes.group, classNames)}>{children}</div>;
};

export default Group;
