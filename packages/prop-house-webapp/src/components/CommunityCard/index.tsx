import classes from './CommunityCard.module.css';
import { useTranslation } from 'react-i18next';
import { House } from '@prophouse/sdk-react';
import HouseProfImg from '../HouseProfImg';

const HouseCard: React.FC<{
  house: House;
}> = props => {
  const { house } = props;
  const { t } = useTranslation();

  return (
    <div className={classes.container}>
      <HouseProfImg house={house} />
      <div className={classes.title}>{house.name}</div>
      <div className={classes.infoContainer}>
        <hr className={classes.divider} />
        <div className={classes.cardInfo}>
          <div className={classes.infoWithSymbol}>
            <div className={classes.infoText}>
              <span className={classes.infoAmount}>
                {/**TODO: resolve for currency */}
                {'houseCurrency'}
              </span>{' '}
              <span className={classes.infoCopy}>{t('funded')}</span>
            </div>
          </div>
          <div className={classes.infoText}>
            <span className={classes.infoAmount}>{house.roundCount}</span>{' '}
            <span className={classes.infoCopy}>
              {house.roundCount === 1 ? t('round') : t('rounds')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseCard;
