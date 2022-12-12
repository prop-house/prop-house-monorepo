import classes from './NoSearchResults.module.css';
import { useTranslation } from 'react-i18next';

const NoSearchResults = () => {
  const { t } = useTranslation();

  return (
    <div className={classes.noResultsContainer}>
      <div className={classes.cardImage}>
        <img src="/cards.svg" alt="cards" />
      </div>

      <div className={classes.textContainer}>
        <div className={classes.message}>{t('noRoundsAvailable')}</div>
      </div>
    </div>
  );
};

export default NoSearchResults;
