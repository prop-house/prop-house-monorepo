import clsx from 'clsx';
import classes from './Divider.module.css';

const Divider: React.FC<{
  narrow?: boolean;
}> = props => {
  const { narrow } = props;

  return <hr className={clsx(classes.divider, narrow && classes.narrow)} />;
};

export default Divider;
