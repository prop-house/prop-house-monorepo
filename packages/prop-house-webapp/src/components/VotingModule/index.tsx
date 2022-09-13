import { useEthers } from '@usedapp/core';
import clsx from 'clsx';
import { ProgressBar } from 'react-bootstrap';
import { MdHowToVote as VoteIcon } from 'react-icons/md';

import classes from './VotingModule.module.css';

export interface VotingModuleProps {
  communityName: string;
  totalVotes: number | undefined;
  delegatedVotes: number | undefined;
  votesLeft: number | undefined;
  submittedVotesCount: number | undefined;
  numAllottedVotes: number | undefined;
}
const VotingModule: React.FC<VotingModuleProps> = (props: VotingModuleProps) => {
  const {
    communityName,
    totalVotes,
    delegatedVotes,
    votesLeft,
    submittedVotesCount,
    numAllottedVotes,
  } = props;
  const { account } = useEthers();

  return (
    <>
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

      {account ? (
        delegatedVotes ? (
          <>
            <h1 className={clsx(classes.sideCardTitle, classes.votingInfo)}>
              <span>Cast your votes</span>

              <span className={classes.totalVotes}>{`${
                votesLeft && votesLeft > 0
                  ? `${delegatedVotes - (submittedVotesCount ?? 0) - (numAllottedVotes ?? 0)} left`
                  : 'no votes left'
              }`}</span>
            </h1>

            <ProgressBar
              className={clsx(
                classes.votingBar,
                submittedVotesCount &&
                  submittedVotesCount > 0 &&
                  delegatedVotes !== submittedVotesCount &&
                  'roundAllotmentBar',
              )}
            >
              <ProgressBar
                variant="success"
                now={
                  100 -
                  Math.abs(((submittedVotesCount ?? 0) - delegatedVotes) / delegatedVotes) * 100
                }
              />

              <ProgressBar
                variant="warning"
                now={Math.abs(((votesLeft ?? 0) - delegatedVotes) / delegatedVotes) * 100}
                key={2}
              />
            </ProgressBar>
          </>
        ) : (
          <p className={classes.subtitle}>
            <b>You don't have any {communityName} required to vote in this house.</b>
          </p>
        )
      ) : (
        <p className={classes.sideCardBody}>
          Owners of the <b>{communityName}</b> token are voting on their favorite proposals.
        </p>
      )}
    </>
  );
};

export default VotingModule;
