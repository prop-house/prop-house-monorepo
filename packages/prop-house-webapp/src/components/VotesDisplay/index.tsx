import classes from './VotesDisplay.module.css';
import { MdHowToVote } from 'react-icons/md';
import { useState } from 'react';
import VotesVerificationModal from '../VotesVerificationModal';
import { Direction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import TruncateThousands from '../TruncateThousands';
import { isTimedAuction } from '../../utils/auctionType';
import { useAppSelector } from '../../hooks';
import ThumbsUpDownButton from '../ThumbsUpButton';
import { countNumVotesForPropWithDirection } from '../../utils/countNumVotesForPropWithDirection';

enum VotesToDisplay {
  ALL,
  UP,
  Down,
}

const VotesDisplay: React.FC<{ proposal: StoredProposalWithVotes }> = props => {
  const { proposal } = props;

  const [displayVotesVerifModal, setDisplayVotesVerifModal] = useState<boolean>(false);
  const [votesToDisplay, setVotesToDisplay] = useState<VotesToDisplay>(VotesToDisplay.ALL);
  const round = useAppSelector(state => state.propHouse.activeRound);

  const upVotes = proposal.votes.filter(v => v.direction === Direction.Up);
  const downVotes = proposal.votes.filter(v => v.direction === Direction.Down);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setVotesToDisplay(VotesToDisplay.ALL);
    if (proposal.votes.length > 0) setDisplayVotesVerifModal(prev => !prev);
    return;
  };

  const handleClickWithDirection = (e: React.MouseEvent<HTMLDivElement>, direction: Direction) => {
    e.stopPropagation();
    setVotesToDisplay(direction === Direction.Up ? VotesToDisplay.UP : VotesToDisplay.Down);
    if (proposal.votes.length > 0) setDisplayVotesVerifModal(prev => !prev);
    return;
  };
  return (
    <>
      {displayVotesVerifModal && (
        <VotesVerificationModal
          setDisplayVotesVerifModal={setDisplayVotesVerifModal}
          proposal={proposal}
          votes={
            votesToDisplay === VotesToDisplay.ALL
              ? proposal.votes
              : votesToDisplay === VotesToDisplay.UP
              ? upVotes
              : downVotes
          }
          direction={
            votesToDisplay === VotesToDisplay.ALL
              ? undefined
              : votesToDisplay === VotesToDisplay.UP
              ? Direction.Up
              : Direction.Down
          }
        />
      )}
      <div onClick={e => handleClick(e)}>
        {round && isTimedAuction(round) ? (
          <>
            <div className={classes.scoreAndIcon}>
              <MdHowToVote /> <TruncateThousands amount={proposal.voteCountFor} />
            </div>
          </>
        ) : (
          <div className={classes.votingBtnsContainer}>
            <ThumbsUpDownButton
              thumbsUp={true}
              handleClick={handleClickWithDirection}
              disabled={upVotes.length === 0}
              amount={countNumVotesForPropWithDirection(proposal.votes, proposal.id, Direction.Up)}
              selected={false}
            />
            <ThumbsUpDownButton
              thumbsUp={false}
              handleClick={handleClickWithDirection}
              disabled={downVotes.length === 0}
              amount={countNumVotesForPropWithDirection(
                proposal.votes,
                proposal.id,
                Direction.Down,
              )}
              selected={false}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default VotesDisplay;
