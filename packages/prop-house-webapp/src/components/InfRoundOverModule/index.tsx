import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import RoundModuleCard from '../RoundModuleCard';
import classes from './InfRoundOverModule.module.css';
import { Round } from '@prophouse/sdk-react';

export interface RoundOverModuleProps {
  totalVotes: number | undefined;
  numOfProposals: number;
  round: Round;
}

const InfRoundOverModule: React.FC<RoundOverModuleProps> = (props: RoundOverModuleProps) => {
  const { numOfProposals, totalVotes, round } = props;
  const { t } = useTranslation();

  const content = (
    <p className={clsx(classes.sideCardBody, classes.winnersText)}>
      {t('winnersAreHighlightedIn')} <span className={classes.greenText}>{t('green')}</span>.
    </p>
  );

  return (
    <RoundModuleCard
      title={'Round has ended'}
      subtitle={<>No awards remaining</>}
      content={<>{`${totalVotes} votes were casted to award ${numOfProposals} proposals`}</>}
      type="winner"
    />
  );
};

export default InfRoundOverModule;
