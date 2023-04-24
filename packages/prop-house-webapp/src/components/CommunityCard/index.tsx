import classes from './CommunityCard.module.css';
import CommunityProfImg from '../CommunityProfImg';
import { useTranslation } from 'react-i18next';
import { House } from '@prophouse/sdk-react';
import { Link } from 'react-router-dom';

const CommunityCard: React.FC<{
  house: House
}> = props => {
  const { house } = props;
  const { t } = useTranslation();

  // No such concept
  // const houseCurrency = getHouseCurrency(community.contractAddress);

  return (
    <div className={classes.container}>
      <Link to={house.address}>
        <CommunityProfImg community={house} />
        <div className={classes.title}>{house.name}</div>
        <div className={classes.infoContainer}>
          <hr className={classes.divider} />
          <div className={classes.cardInfo}>
            <div className={classes.infoWithSymbol}>
              <div className={classes.infoText}>
                {/* <span className={classes.infoAmount}>
                  <TruncateThousands
                    amount={houseCurrency === 'Ξ' ? community.ethFunded : community.totalFunded}
                  />{' '}
                  {houseCurrency}
                </span>{' '} */}
                {/* <span className={classes.infoCopy}>{t('funded')}</span> */}
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
      </Link>
    </div>
  );
};

export default CommunityCard;
