import { ProgressBar } from 'react-bootstrap';
import classes from './ProposalModalFooter.module.css';
import clsx from 'clsx';
import PropCardVotingModule from '../PropCardVotingModule';

import { ProposalCardStatus } from '../../utils/cardStatus';
import Button, { ButtonColor } from '../Button';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import TruncateThousands from '../TruncateThousands';

import { voteWeightForAllottedVotes } from '../../utils/voteWeightForAllottedVotes';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ImArrowLeft2, ImArrowRight2 } from 'react-icons/im';
import { BsCardChecklist } from 'react-icons/bs';
import { Direction } from '@nouns/prop-house-wrapper/dist/builders';
import Divider from '../Divider';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { useEthers } from '@usedapp/core';
import { useAppSelector } from '../../hooks';
import useWeb3Modal from '../../hooks/useWeb3Modal';
import { votesRemaining } from '../../utils/votesRemaining';
import Tooltip from '../Tooltip';

import { useDispatch } from 'react-redux';
import { getNumVotes } from 'prop-house-communities';
import { setNumSubmittedVotes, setVotingPower } from '../../state/slices/voting';
import { aggVoteWeightForProps } from '../../utils/aggVoteWeight';
import removeZeroVotesAndSortByVotes from '../../utils/removeZeroVotesAndSortByVotes';

const ProposalModalFooter: React.FC<{
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
  propIndex: number | undefined;
  numberOfProps: number;
  handleDirectionalArrowClick: (e: any) => void;
}> = props => {
  const { setShowVotingModal, propIndex, numberOfProps, handleDirectionalArrowClick } = props;

  const { account, library } = useEthers();
  const connect = useWeb3Modal();
  const dispatch = useDispatch();

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);

  const votingPower = useAppSelector(state => state.voting.votingPower);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);

  const [votesLeftToAllot, setVotesLeftToAllot] = useState(0);
  const [numAllotedVotes, setNumAllotedVotes] = useState(0);

  const isVotingWindow = round && auctionStatus(round) === AuctionStatus.AuctionVoting;

  useEffect(() => {
    if (!account || !library || !community) return;

    const fetchVotes = async () => {
      try {
        const votes = await getNumVotes(
          account,
          community.contractAddress,
          library,
          round!.balanceBlockTag,
        );
        dispatch(setVotingPower(votes));
      } catch (e) {
        console.log('error fetching votes: ', e);
      }
    };
    fetchVotes();
  }, [account, library, dispatch, community, round]);

  // update submitted votes on proposal changes
  useEffect(() => {
    if (proposals && account)
      dispatch(setNumSubmittedVotes(aggVoteWeightForProps(proposals, account)));
  }, [proposals, account, dispatch]);

  useEffect(() => {
    setVotesLeftToAllot(votesRemaining(votingPower, submittedVotes, voteAllotments));
    setNumAllotedVotes(voteWeightForAllottedVotes(voteAllotments));
  }, [submittedVotes, voteAllotments, votingPower]);

  const voteAllotmentsForTooltip = removeZeroVotesAndSortByVotes(voteAllotments).map(
    v => `${v.votes} - ${v.proposalTitle}`,
  );

  return (
    <>
      <div className={clsx(classes.footerContainer, 'footer')}>
        {/* VOTING WINDOW, NOT CONNECTED */}
        {isVotingWindow && !account && (
          <Button text={'Connect to vote'} bgColor={ButtonColor.Pink} onClick={connect} />
        )}

        {/* VOTING PERIOD, CONNECTED, HAS VOTES */}
        {account && proposal && isVotingWindow && votingPower ? (
          <>
            <div className={classes.votingContainer}>
              <div className={classes.votingBarAndTooltip}>
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

                <Tooltip
                  content={
                    <div className={classes.allottedVotesTooltip}>
                      <BsCardChecklist size={'1.5rem'} />
                    </div>
                  }
                  tooltipContent={`${
                    voteAllotmentsForTooltip.length > 0
                      ? voteAllotmentsForTooltip.toString().replaceAll(',', '\n')
                      : 'vote allotements will appear here'
                  }`}
                />
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
        ) : (
          <></>
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

export default ProposalModalFooter;
