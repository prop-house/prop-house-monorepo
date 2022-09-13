import { useEthers } from '@usedapp/core';
import clsx from 'clsx';
import { MdHowToVote as VoteIcon } from 'react-icons/md';

import classes from './VotingModule.module.css';

export interface VotingModuleProps {
  communityName: string;
  totalVotes: number | undefined;
  delegatedVotes: number | undefined;
}
const VotingModule: React.FC<VotingModuleProps> = (props: VotingModuleProps) => {
  const { communityName, totalVotes, delegatedVotes } = props;
  const { account } = useEthers();

  return (
    <>
      {/* CONNECTED & NOT CONNECTED */}
      <div className={classes.sideCardHeader}>
        <div className={clsx(classes.icon, classes.purpleIcon)}>
          <VoteIcon />
        </div>
        <div className={classes.textContainer}>
          <p className={classes.title}>Voting in progress</p>
          <p className={classes.subtitle}>
            <span className={classes.purpleText}>{totalVotes}</span>{' '}
            {totalVotes === 1 ? 'vote' : 'votes'} cast so far!
          </p>
        </div>
      </div>

      <hr className={classes.divider} />

      {/* NOT CONNECTED */}
      {!account && (
        <p className={classes.sideCardBody}>
          Owners of the <b>{communityName}</b> token are voting on their favorite proposals.
        </p>
      )}

      {/* CONNECTED, NO VOTES */}
      {account && !delegatedVotes && (
        <p className={classes.subtitle}>
          <b>You don't have any {communityName} required to vote in this house.</b>
        </p>
      )}
    </>
  );
};

export default VotingModule;
