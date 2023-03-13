import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import RoundModuleCard from '../RoundModuleCard';
import classes from './RoundOverModule.module.css';

export interface RoundOverModuleProps {
  totalVotes: number | undefined;
  numOfProposals: number;
}

const RoundOverModule: React.FC<RoundOverModuleProps> = (props: RoundOverModuleProps) => {
  const { numOfProposals, totalVotes } = props;
  const { t } = useTranslation();

  const content = (
    <>
      <div className={classes.sideCardHeader}>
        <div className={clsx(classes.icon, classes.blackIcon)}>
          <VoteIcon />
        </div>
        <div className={classes.textContainer}>
          <p className={classes.title}>{t('votingEnded')}</p>
          {numOfProposals ? (
            <p className={classes.subtitle}>
              {totalVotes?.toFixed()} {Number(totalVotes?.toFixed()) === 1 ? t('vote') : t('votes')}{' '}
              {t('castFor')} {numOfProposals} {numOfProposals === 1 ? t('prop') : t('props')}!
            </p>
          ) : (
            <></>
          )}
        </div>
      </div>

      <hr className={classes.divider} />

      <p className={clsx(classes.sideCardBody, classes.winnersText)}>
        {t('winnersAreHighlightedIn')} <span className={classes.greenText}>{t('green')}</span>.
      </p>
    </>
  );

  return <RoundModuleCard content={content} />;
};

export default RoundOverModule;
