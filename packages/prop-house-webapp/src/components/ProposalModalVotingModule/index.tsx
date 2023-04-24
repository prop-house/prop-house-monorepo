import { ProgressBar } from 'react-bootstrap';
import classes from './ProposalModalVotingModule.module.css';
import clsx from 'clsx';
import VotingControls from '../VotingControls';
import Button, { ButtonColor } from '../Button';
import { countTotalVotesAlloted } from '../../utils/countTotalVotesAlloted';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useAppSelector } from '../../hooks';
import { countVotesRemainingForTimedRound } from '../../utils/countVotesRemainingForTimedRound';
import { useDispatch } from 'react-redux';
import { getVotingPower } from 'prop-house-communities';
import { setVotesByUserInActiveRound, setVotingPower } from '../../state/slices/voting';
import VoteAllotmentTooltip from '../VoteAllotmentTooltip';
import VotesDisplay from '../VotesDisplay';
import { countNumVotes } from '../../utils/countNumVotes';
import { useAccount, useProvider } from 'wagmi';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { countVotesRemainingForInfRound } from '../../utils/countVotesRemainingForInfRound';
import { countNumVotesForProp } from '../../utils/countNumVotesForProp';
import { countVotesAllottedToProp } from '../../utils/countVotesAllottedToProp';
import { Proposal, usePropHouse } from '@prophouse/sdk-react';

const ProposalModalVotingModule: React.FC<{
  proposal: Proposal;
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
  setShowVoteAllotmentModal: Dispatch<SetStateAction<boolean>>;
  isWinner?: boolean;
}> = props => {
  const { proposal, setShowVotingModal, setShowVoteAllotmentModal, isWinner } = props;

  const provider = useProvider();
  const propHouse = usePropHouse();
  const { address: account } = useAccount();

  const dispatch = useDispatch();

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);

  const votingPower = useAppSelector(state => state.voting.votingPower);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votesByUserInActiveRound = useAppSelector(state => state.voting.votesByUserInActiveRound);

  const numVotesCasted =
    round && isTimedAuction(round)
      ? countNumVotes(votesByUserInActiveRound)
      : countNumVotesForProp(votesByUserInActiveRound, proposal.id);

  const votesRemaining =
    round && isInfAuction(round)
      ? countVotesRemainingForInfRound(
          proposal.id,
          votingPower,
          votesByUserInActiveRound,
          voteAllotments,
        )
      : countVotesRemainingForTimedRound(votingPower, votesByUserInActiveRound, voteAllotments);

  const votesAlloted =
    round && isTimedAuction(round)
      ? countTotalVotesAlloted(voteAllotments)
      : countVotesAllottedToProp(voteAllotments, proposal.id);

  useEffect(() => {
    if (!account || !provider || !community) return;

    const fetchVotes = async () => {
      if (!round) return;
        
      try {
        const { votingStrategies } = await propHouse.query.getRoundVotingStrategies(round.address);
        const votes = await propHouse.voting.getTotalVotingPower(
          account,
          round.config.proposalPeriodEndTimestamp,
          votingStrategies,
        );
        dispatch(setVotingPower(votes.toNumber())); // TODO: Support base units
      } catch (e) {
        console.log('error fetching votes: ', e);
      }
    };
    fetchVotes();
  }, [account, provider, dispatch, community, round, propHouse.query, propHouse.voting]);

  // update submitted votes on proposal changes
  useEffect(() => {
    if (proposals && account) {}
      // TODO: Fetch votes by user in active round
      // dispatch(
      //   setVotesByUserInActiveRound(
      //     proposals.flatMap(p => p.votes).filter(v => v.address === account),
      //   ),
      // );
  }, [proposals, account, dispatch]);

  return (
    <>
      <div className={classes.votingContainer}>
        <div className={classes.votingBarAndTooltip}>
          <div className={classes.votingProgressBar}>
            <div className={classes.votingInfo}>
              <span>Cast your votes</span>

              <span className={classes.totalVotes}>
                <VoteAllotmentTooltip setShowVoteAllotmentModal={setShowVoteAllotmentModal} />

                {`${votesRemaining > 0 ? `${votesRemaining} left` : 'no votes left'}`}
              </span>
            </div>

            <ProgressBar
              className={clsx(
                classes.votingBar,
                numVotesCasted > 0 && votingPower !== numVotesCasted && 'roundAllotmentBar',
              )}
            >
              <ProgressBar variant="success" now={(numVotesCasted / votingPower) * 100} />

              <ProgressBar variant="warning" now={(votesAlloted / votingPower) * 100} key={2} />
            </ProgressBar>
          </div>
        </div>

        <div className={classes.voteAllotmentSection}>
          {isWinner && (
            <div className={classes.crownNoun}>
              <img src="/heads/crown.png" alt="crown" />
            </div>
          )}

          <div className={classes.icon}>
            <VotesDisplay proposal={proposal} /> <span>+</span>
          </div>

          <div className="mobileTooltipContainer">
            <VotingControls proposal={proposal} />

            <VoteAllotmentTooltip setShowVoteAllotmentModal={setShowVoteAllotmentModal} />
          </div>

          <Button
            classNames={classes.submitVotesButton}
            text={'Submit votes'}
            bgColor={ButtonColor.Purple}
            disabled={
              countTotalVotesAlloted(voteAllotments) === 0 || numVotesCasted === votingPower
            }
            onClick={() => setShowVotingModal(true)}
          />
        </div>
      </div>
    </>
  );
};

export default ProposalModalVotingModule;
