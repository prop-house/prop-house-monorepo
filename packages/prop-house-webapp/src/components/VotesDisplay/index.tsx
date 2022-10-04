import classes from './VotesDisplay.module.css';
import { MdHowToVote } from 'react-icons/md';
import { useState } from 'react';
import VotesVerificationModal from '../VotesVerificationModal';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import TruncateThousands from '../TruncateThousands';

const VotesDisplay: React.FC<{ proposal: StoredProposalWithVotes }> = props => {
  const { proposal } = props;

  const [displayVotesVerifModal, setDisplayVotesVerifModal] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (proposal.votes.length > 0) setDisplayVotesVerifModal(prev => !prev);
    return;
  };
  return (
    <>
      {displayVotesVerifModal && (
        <VotesVerificationModal setDisplay={setDisplayVotesVerifModal} proposal={proposal} />
      )}
      <div onClick={e => handleClick(e)}>
        <div className={classes.scoreAndIcon}>
          <MdHowToVote /> <TruncateThousands amount={proposal.voteCount} />
        </div>
      </div>
    </>
  );
};

export default VotesDisplay;
