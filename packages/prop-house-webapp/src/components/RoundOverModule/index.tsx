import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import RoundModuleCard from '../RoundModuleCard';
import classes from './RoundOverModule.module.css';

export interface RoundOverModuleProps {
  totalVotes: number;
  numOfProposals: number;
}

const RoundOverModule: React.FC<RoundOverModuleProps> = (props: RoundOverModuleProps) => {
  const { numOfProposals, totalVotes } = props;
  const { t } = useTranslation();

  const content = (
    <p className={clsx(classes.sideCardBody, classes.winnersText)}>
      {t('winnersAreHighlightedIn')} <span className={classes.greenText}>{t('green')}</span>.
    </p>
  );

  return (
    <RoundModuleCard
      title={t('votingEnded')}
      subtitle={
        <>
          {totalVotes?.toFixed()} {Number(totalVotes?.toFixed()) === 1 ? t('vote') : t('votes')}{' '}
          {t('castFor')} {numOfProposals} {numOfProposals === 1 ? t('prop') : t('props')}!
        </>
      }
      content={content}
      type="ended"
    />
  );
};

export default RoundOverModule;
