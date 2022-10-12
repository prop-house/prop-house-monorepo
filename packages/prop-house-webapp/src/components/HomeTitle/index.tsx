import classes from './HomeTitle.module.css';
import { useTranslation } from 'react-i18next';

const HomeTitle = () => {
  const { t } = useTranslation();

  return (
    <div className={classes.title}>
      <h1 className={classes.fundedText}>
        <span>{t('getFunded')}</span>
        <div className={classes.build}>
          <span>{t('build')}</span>
          <img src="/line.svg" alt="line" />
        </div>
        <span>{t('with')}</span>
      </h1>

      <h1>{t('yourFavCommunities')}</h1>
    </div>
  );
};

export default HomeTitle;
