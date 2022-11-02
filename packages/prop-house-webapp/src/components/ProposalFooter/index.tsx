import { ProgressBar } from 'react-bootstrap';
import classes from './ProposalFooter.module.css';
import { useEthers } from '@usedapp/core';
import clsx from 'clsx';
import PropCardVotingModule from '../PropCardVotingModule';
import { StoredAuction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { ProposalCardStatus } from '../../utils/cardStatus';
import Button, { ButtonColor } from '../Button';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import TruncateThousands from '../TruncateThousands';
import { VoteAllotment } from '../../types/VoteAllotment';
import { voteWeightForAllottedVotes } from '../../utils/voteWeightForAllottedVotes';
import { Dispatch, SetStateAction } from 'react';

export interface ProposalFooterProps {}

const ProposalFooter: React.FC<{
  round: StoredAuction;
  proposal: StoredProposalWithVotes;
  votingPower: number;
  votesLeftToAllot: number;
  numAllotedVotes: number;
  submittedVotes: number;
  voteAllotments: VoteAllotment[];
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const {
    proposal,
    votingPower,
    votesLeftToAllot,
    numAllotedVotes,
    submittedVotes,
    voteAllotments,
    setShowVotingModal,
  } = props;

  const { account } = useEthers();

  return (
    <>
      <div className={classes.footerContainer}>
        {account && votingPower > 0 && (
          <div className={classes.votingContainer}>
            <div className={classes.votingProgressBar}>
              <div className={classes.votingInfo}>
                <span>Cast your votes</span>

                <span className={classes.totalVotes}>{`${
                  votesLeftToAllot > 0
                    ? `${votingPower - submittedVotes - numAllotedVotes} left`
                    : 'no votes left'
                }`}</span>
              </div>

              <ProgressBar
                className={clsx(
                  classes.votingBar,
                  submittedVotes > 0 && votingPower !== submittedVotes && 'roundAllotmentBar',
                )}
              >
                <ProgressBar variant="success" now={(submittedVotes / votingPower) * 100} />

                <ProgressBar
                  variant="warning"
                  now={(numAllotedVotes / votingPower) * 100}
                  key={2}
                />
              </ProgressBar>
            </div>

            <div className={classes.voteAllotmentSection}>
              <div className={classes.icon}>
                <VoteIcon /> <TruncateThousands amount={proposal.voteCount} /> <span>+</span>
              </div>

              <PropCardVotingModule proposal={proposal} cardStatus={ProposalCardStatus.Voting} />

              <Button
                classNames={classes.submitVotesButton}
                text={'Submit votes'}
                bgColor={ButtonColor.Purple}
                disabled={
                  voteWeightForAllottedVotes(voteAllotments) === 0 || submittedVotes === votingPower
                }
                onClick={() => setShowVotingModal(true)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProposalFooter;
