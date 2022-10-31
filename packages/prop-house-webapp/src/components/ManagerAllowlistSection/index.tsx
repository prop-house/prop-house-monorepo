import classes from './ManagerAllowlistSection.module.css';

const ManagerAllowlistSection = () => {
  return (
    <>
      <div className={classes.allowlistSection}>
        <div className={classes.strategy}>
          <input type="checkbox" />

          <div className={classes.sections}>
            <div className={classes.section}>
              <p className={classes.title}>Allowlist</p>
              <p className={classes.subtitle}>
                Provides a list of voter addresses that can participate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerAllowlistSection;
