import clsx from 'clsx';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import classes from './RoundOverModule.module.css';

export interface RoundOverModuleProps {
  totalVotes: number | undefined;
  numOfProposals: number | undefined;
}

const RoundOverModule: React.FC<RoundOverModuleProps> = (props: RoundOverModuleProps) => {
  const { numOfProposals, totalVotes } = props;

  return (
    <>
      <div className={classes.sideCardHeader}>
        <div className={clsx(classes.icon, classes.blackIcon)}>
          <VoteIcon />
        </div>
        <div className={classes.textContainer}>
          <p className={classes.title}>Voting ended</p>
          {numOfProposals && (
            <p className={classes.subtitle}>
              {totalVotes?.toFixed()} {Number(totalVotes?.toFixed()) === 1 ? 'vote' : 'votes'} cast
              for {numOfProposals} props!
            </p>
          )}
        </div>
      </div>

      <hr className={classes.divider} />

      <p className={clsx(classes.sideCardBody, classes.winnersText)}>
        Winners are highlighted in <span className={classes.greenText}>green</span>.
      </p>
    </>
  );
};

export default RoundOverModule;
