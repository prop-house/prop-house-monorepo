import classes from './CommunityCard.module.css';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import CommunityProfImg from '../CommunityProfImg';
import { useTranslation } from 'react-i18next';
import TruncateThousands from '../TruncateThousands';

const CommunityCard: React.FC<{
  community: Community;
}> = props => {
  const { community } = props;
  const { t } = useTranslation();

  return (
    <div className={classes.container}>
      <CommunityProfImg community={community} />
      <div className={classes.title}>{community.name}</div>
      <div className={classes.infoContainer}>
        <hr className={classes.divider} />
        <div className={classes.cardInfo}>
          <div className={classes.infoWithSymbol}>
            <div className={classes.infoText}>
              <span className={classes.infoAmount}>
                {community.contractAddress === '0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7'
                  ? 'APE'
                  : 'Ξ'}{' '}
                <TruncateThousands amount={community.ethFunded} />
              </span>{' '}
              <span className={classes.infoCopy}>funded</span>
            </div>
          </div>
          <div className={classes.infoText}>
            <span className={classes.infoAmount}>{community.numAuctions}</span>{' '}
            <span className={classes.infoCopy}>
              {community.numAuctions === 1 ? t('round') : t('rounds')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
