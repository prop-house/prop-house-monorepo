import classes from './CommunityCard.module.css';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import CommunityProfImg from '../CommunityProfImg';
import { useTranslation } from 'react-i18next';

const CommunityCard: React.FC<{
  community: Community;
}> = props => {
  const { community } = props;
  const { t } = useTranslation();

  return (
    <div className={classes.container}>
      <div className={classes.title}>{community.name}</div>
      <CommunityProfImg community={community} />
      <div className={classes.infoContainer}>
        <div className={classes.infoWithSymbol}>
          <div className={classes.symbolContainer}>
            <img src="/eth.png" alt="eth" />
          </div>
          <div className={classes.infoText}>
            <span className={classes.infoAmount}>{community.ethFunded}</span>{' '}
            <span className={classes.infoCopy}>funded</span>
          </div>
        </div>

        <hr className={classes.divider} />

        <div className={classes.cardInfo}>
          <div className={classes.infoText}>
            <span className={classes.infoAmount}>{community.numAuctions}</span>{' '}
            <span className={classes.infoCopy}>
              {community.numAuctions === 1 ? t('round') : t('rounds')}
            </span>
          </div>

          <div className={classes.infoText}>
            <span className={classes.infoAmount}>{community.numProposals}</span>{' '}
            <span className={classes.infoCopy}>
              {community.numProposals === 1 ? t('prop') : t('props')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
