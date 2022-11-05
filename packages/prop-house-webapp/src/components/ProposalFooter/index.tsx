import { ProgressBar } from 'react-bootstrap';
import classes from './ProposalFooter.module.css';
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
import { ImArrowLeft2, ImArrowRight2 } from 'react-icons/im';
import { Direction } from '@nouns/prop-house-wrapper/dist/builders';
import Divider from '../Divider';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { useEthers } from '@usedapp/core';

const ProposalFooter: React.FC<{
  round: StoredAuction;
  proposal: StoredProposalWithVotes;
  votingPower: number;
  votesLeftToAllot: number;
  numAllotedVotes: number;
  submittedVotes: number;
  voteAllotments: VoteAllotment[];
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
  propIndex: number | undefined;
  numberOfProps: number;
  handleDirectionalArrowClick: (e: any) => void;
}> = props => {
  const {
    proposal,
    votingPower,
    votesLeftToAllot,
    numAllotedVotes,
    submittedVotes,
    voteAllotments,
    setShowVotingModal,
    propIndex,
    numberOfProps,
    handleDirectionalArrowClick,
    round,
  } = props;

  const { account } = useEthers();

  return (
    <>
      <div className={clsx(classes.footerContainer, 'footer')}>
        {account && votingPower > 0 && auctionStatus(round) === AuctionStatus.AuctionVoting && (
          <>
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
                    voteWeightForAllottedVotes(voteAllotments) === 0 ||
                    submittedVotes === votingPower
                  }
                  onClick={() => setShowVotingModal(true)}
                />
              </div>
            </div>
            <span className={classes.footerDivider}>
              <Divider />
            </span>
          </>
        )}

        <div className={classes.btnContainer}>
          <div className={classes.propNavigationButtons}>
            <button
              disabled={propIndex === 1}
              onClick={() => handleDirectionalArrowClick(Direction.Down)}
            >
              <ImArrowLeft2 size={'1.5rem'} />
              <span>Back</span>
            </button>

            <button
              onClick={() => handleDirectionalArrowClick(Direction.Up)}
              disabled={propIndex === numberOfProps}
            >
              <span>Next</span> <ImArrowRight2 size={'1.5rem'} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProposalFooter;
