import classes from './ManagerNamingSection.module.css';

const ManagerNamingSection = () => {
  return (
    <>
      <div className={classes.nameHouseSection}>
        <div className={classes.imgContainer}>
          <img src="tricolor.png" alt="drop-img-here" />
        </div>

        <div className={classes.inputs}>
          <div className={classes.titleAndInput}>
            <p className={classes.subtitle}>Name your House</p>
            <input placeholder="ex. Nouns" />
          </div>

          <div className={classes.titleAndInput}>
            <p className={classes.subtitle}>Add an image</p>
            <input placeholder="ex. https://example.com/nouns.jpg" />
            <span className={classes.inputNote}>
              Enter a url for a hosted image to represents your House.
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerNamingSection;
