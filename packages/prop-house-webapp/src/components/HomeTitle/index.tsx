import classes from './HomeTitle.module.css';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const HomeTitle = () => {
  const { t } = useTranslation();

  return (
    <div className={classes.title}>
      {i18next.resolvedLanguage === 'jp' ? (
        <div className={classes.jpTitle}>
          <h1 className={classes.fundedText}>
            <span>{t('yourFavCommunities')}</span>
          </h1>

          <h1 className={classes.fundedText}>
            <div className={classes.build}>
              <span>{t('build')}</span>
              <img src="/line.svg" alt="line" />
            </div>
            {t('with')} {t('getFunded')}
          </h1>
        </div>
      ) : (
        <>
          <h1 className={classes.fundedText}>
            <span>{t('getFunded')}</span>
            <div className={classes.build}>
              <span>{t('build')}</span>
              <img src="/line.svg" alt="line" />
            </div>
            <span>{t('with')}</span>
          </h1>
          <h1>{t('yourFavCommunities')}</h1>
        </>
      )}
    </div>
  );
};

export default HomeTitle;
