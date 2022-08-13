import classes from './NoSearchResults.module.css';

interface NoSearchResultsProps {
  input: string;
}

const NoSearchResults = ({ input }: NoSearchResultsProps) => {
  return (
    <div className={classes.noResultsContainer}>
      <div className={classes.cardImage}>
        <img src="/cards.svg" alt="cards" />
      </div>

      <div className={classes.textContainer}>
        <div className={classes.message}>{`No round for '${input}'`}</div>
        <div className={classes.tryAgain}>Try another search term</div>
      </div>
    </div>
  );
};

export default NoSearchResults;
