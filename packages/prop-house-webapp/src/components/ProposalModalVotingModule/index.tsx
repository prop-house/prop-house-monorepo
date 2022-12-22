import { ProgressBar } from 'react-bootstrap';
import classes from './ProposalModalVotingModule.module.css';
import clsx from 'clsx';
import PropCardVotingModule from '../PropCardVotingModule';
import Button, { ButtonColor } from '../Button';
import { voteWeightForAllottedVotes } from '../../utils/voteWeightForAllottedVotes';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { useAppSelector } from '../../hooks';
import { votesRemaining } from '../../utils/votesRemaining';
import { useDispatch } from 'react-redux';
import { getNumVotes } from 'prop-house-communities';
import { setNumSubmittedVotes, setVotingPower } from '../../state/slices/voting';
import { aggVoteWeightForProps } from '../../utils/aggVoteWeight';
import VoteAllotmentTooltip from '../VoteAllotmentTooltip';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import VotesDisplay from '../VotesDisplay';

const ProposalModalFooter: React.FC<{
  proposal: StoredProposalWithVotes;
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
  setShowVoteAllotmentModal: Dispatch<SetStateAction<boolean>>;
  isWinner?: boolean;
}> = props => {
  const { proposal, setShowVotingModal, setShowVoteAllotmentModal, isWinner } = props;

  const { account, library } = useEthers();
  const dispatch = useDispatch();

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);

  const votingPower = useAppSelector(state => state.voting.votingPower);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);

  const [votesLeftToAllot, setVotesLeftToAllot] = useState(0);
  const [numAllotedVotes, setNumAllotedVotes] = useState(0);

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

  return (
    <>
      <div className={classes.votingContainer}>
        <div className={classes.votingBarAndTooltip}>
          <div className={classes.votingProgressBar}>
            <div className={classes.votingInfo}>
              <span>Cast your votes</span>

              <span className={classes.totalVotes}>
                <VoteAllotmentTooltip
                  setShowVoteAllotmentModal={setShowVoteAllotmentModal}
                />

                {`${votesLeftToAllot > 0
                  ? `${votingPower - submittedVotes - numAllotedVotes} left`
                  : 'no votes left'
                  }`}
              </span>
            </div>

            <ProgressBar
              className={clsx(
                classes.votingBar,
                submittedVotes > 0 && votingPower !== submittedVotes && 'roundAllotmentBar',
              )}
            >
              <ProgressBar variant="success" now={(submittedVotes / votingPower) * 100} />

              <ProgressBar variant="warning" now={(numAllotedVotes / votingPower) * 100} key={2} />
            </ProgressBar>
          </div>
        </div>

        <div className={classes.voteAllotmentSection}>
          {isWinner && <div className={classes.crownNoun}>
            <img src="/heads/crown.png" alt="crown" />
          </div>}

          <div className={classes.icon}>
            <VotesDisplay proposal={proposal} /> <span>+</span>
          </div>

          <div className="mobileTooltipContainer">
            <PropCardVotingModule proposal={proposal} />

            <VoteAllotmentTooltip
              setShowVoteAllotmentModal={setShowVoteAllotmentModal}
            />
          </div>

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
    </>
  );
};

export default ProposalModalFooter;