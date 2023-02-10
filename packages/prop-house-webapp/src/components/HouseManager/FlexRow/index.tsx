import classes from './FlexRow.module.css';

const FlexRow: React.FC<{
  children: React.ReactNode;
}> = props => {
  const { children } = props;

  return <div className={classes.row}>{children}</div>;
};

export default FlexRow;
