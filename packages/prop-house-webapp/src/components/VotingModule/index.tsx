import clsx from 'clsx';
import { useEthers } from '@usedapp/core';
import { useEffect, useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import { useAppSelector } from '../../hooks';
import { votesRemaining } from '../../utils/votesRemaining';
import { voteWeightForAllottedVotes } from '../../utils/voteWeightForAllottedVotes';

import classes from './VotingModule.module.css';

export interface VotingModuleProps {
  communityName: string;
  totalVotes: number | undefined;
}
const VotingModule: React.FC<VotingModuleProps> = (props: VotingModuleProps) => {
  const { communityName, totalVotes } = props;
  const { account } = useEthers();

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);

  const [votesLeftToAllot, setVotesLeftToAllot] = useState(0);
  const [numAllotedVotes, setNumAllotedVotes] = useState(0);

  useEffect(() => {
    setVotesLeftToAllot(votesRemaining(votingPower, submittedVotes, voteAllotments));
    setNumAllotedVotes(voteWeightForAllottedVotes(voteAllotments));
  }, [submittedVotes, voteAllotments, votingPower]);

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
        votingPower > 0 ? (
          <>
            <h1 className={clsx(classes.sideCardTitle, classes.votingInfo)}>
              <span>Cast your votes</span>

              <span className={classes.totalVotes}>{`${
                votesLeftToAllot > 0
                  ? `${votingPower - submittedVotes - numAllotedVotes} left`
                  : 'no votes left'
              }`}</span>
            </h1>

            <ProgressBar
              className={clsx(
                classes.votingBar,
                submittedVotes > 0 && votingPower !== submittedVotes && 'roundAllotmentBar',
              )}
            >
              <ProgressBar variant="success" now={(submittedVotes / votingPower) * 100} />

              <ProgressBar variant="warning" now={(numAllotedVotes / votingPower) * 100} key={2} />
            </ProgressBar>
          </>
        ) : (
          <p className={classes.subtitle}>
            <b>You don't have any {communityName} required to vote in this house.</b>
          </p>
        )
      ) : (
        <p className={classes.sideCardBody}>
          <b>Proposers:</b>
          <div className={classes.bulletList}>
            <div className={classes.bulletItem}>
              <p>Connect your wallet to vote of view the status of your proposal.</p>
            </div>
          </div>

          <b>Voters:</b>
          <div className={classes.bulletList}>
            <div className={classes.bulletItem}>
              <p>Connect and vote on your favorite proposals.</p>
            </div>
          </div>
        </p>
      )}
    </>
  );
};

export default VotingModule;
