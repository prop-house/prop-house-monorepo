import clsx from 'clsx';
import classes from './Divider.module.css';

const Divider: React.FC<{
  noMarginUp?: boolean;
  noMarginDown?: boolean;
}> = props => {
  const { noMarginUp, noMarginDown } = props;

  return (
    <hr
      className={clsx(
        classes.divider,
        noMarginUp && classes.noMarginUp,
        noMarginDown && classes.noMarginDown,
      )}
    />
  );
};

export default Divider;
