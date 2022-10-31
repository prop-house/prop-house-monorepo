import classes from './ManagerStrategiesSection.module.css';

const ManagerStrategiesSection = () => {
  return (
    <>
      <div className={classes.supportedStrategiesSection}>
        <p className={classes.title}>Supported strategies</p>
        <p className={classes.subtitle}>
          Select any possible the voting strategies that should be avaliable to use on any later
          rounds created for your House. You can decide on which strategy to use when creating each
          Round.
        </p>
      </div>
    </>
  );
};

export default ManagerStrategiesSection;
