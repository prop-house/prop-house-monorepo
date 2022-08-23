import classes from './NoSearchResults.module.css';

const NoSearchResults = () => {
  return (
    <div className={classes.noResultsContainer}>
      <div className={classes.cardImage}>
        <img src="/doom.png" alt="cards" />
      </div>

      <div className={classes.textContainer}>
        <div className={classes.message}>No rounds available</div>
      </div>
    </div>
  );
};

export default NoSearchResults;
