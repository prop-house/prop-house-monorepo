import classes from './HomeStats.module.css';

const HomeStats = () => {
  return (
    <div className={classes.statsContainer}>
      <div className={classes.stat}>
        <p className={classes.amount}>400+</p>
        <p className={classes.subtitle}>ETH funded</p>
      </div>

      <div className={classes.stat}>
        <p className={classes.amount}>15k+</p>
        <p className={classes.subtitle}>Total votes</p>
      </div>

      <div className={classes.stat}>
        <p className={classes.amount}>1K+</p>
        <p className={classes.subtitle}>Submitted props</p>
      </div>
    </div>
  );
};

export default HomeStats;
