import { TimedAuction } from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { MdOutlineLightbulb as BulbIcon } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

import classes from './AcceptingPropsModule.module.css';

export interface AcceptingPropsModuleProps {
  auction: TimedAuction;
  communityName: string;
}
const AcceptingPropsModule: React.FC<AcceptingPropsModuleProps> = (
  props: AcceptingPropsModuleProps,
) => {
  const { auction, communityName } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className={classes.sideCardHeader}>
        <div className={clsx(classes.icon, classes.greenIcon)}>
          <BulbIcon />
        </div>
        <div className={classes.textContainer}>
          <p className={classes.title}>{t('acceptingProposals')}</p>
          <p className={classes.subtitle}>
            Until {dayjs(auction.proposalEndTime).format('MMMM D')}
          </p>
        </div>
      </div>

      <hr className={classes.divider} />

      <p className={classes.sideCardBody}>
        <b>{t('howProposingWorks')}:</b>

        <div className={classes.bulletList}>
          <div className={classes.bulletItem}>
            <hr className={classes.bullet} />
            <p>{t('anyoneCanSubmit')}.</p>
          </div>

          <div className={classes.bulletItem}>
            <hr className={classes.bullet} />
            <p>
              {t('ownersOfThe')} <b>{communityName}</b> {t('tokenWillVote')}.
            </p>
          </div>

          <div className={classes.bulletItem}>
            <hr className={classes.bullet} />
            <p>
              {t('theTop')} <b>{auction.numWinners}</b>{' '}
              {auction.numWinners === 1 ? 'proposal' : 'proposals'} {t('willGetFunded')}{' '}
              <b>
                {auction.fundingAmount} {auction.currencyType}{' '}
              </b>
              {t('each')}.
            </p>
          </div>
        </div>
      </p>
    </>
  );
};

export default AcceptingPropsModule;
