import classes from './HomeTitle.module.css';

const HomeTitle = () => {
  return (
    <div className={classes.title}>
      <h1 className={classes.fundedText}>
        <span> Get funded to</span>
        <div className={classes.build}>
          <span>build</span>
          <img src="/line.svg" alt="line" />
        </div>
        <span>with</span>
      </h1>

      <h1>your favorite communities</h1>
    </div>
  );
};

export default HomeTitle;
