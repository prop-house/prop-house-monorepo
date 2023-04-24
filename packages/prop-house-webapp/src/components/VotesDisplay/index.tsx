import classes from './VotesDisplay.module.css';
import { MdHowToVote } from 'react-icons/md';
import { useState } from 'react';
import VotesVerificationModal from '../VotesVerificationModal';
import TruncateThousands from '../TruncateThousands';
import { Proposal, usePropHouse, Vote } from '@prophouse/sdk-react';

const VotesDisplay: React.FC<{ proposal: Proposal }> = props => {
  const { proposal } = props;

  const [displayVotesVerifModal, setDisplayVotesVerifModal] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDisplayVotesVerifModal(prev => !prev);
    return;
  };
  return (
    <>
      {displayVotesVerifModal && (
        <VotesVerificationModal
          setDisplayVotesVerifModal={setDisplayVotesVerifModal}
          proposal={proposal}
        />
      )}
      <div onClick={e => handleClick(e)}>
        <div className={classes.scoreAndIcon}>
          <MdHowToVote /> <TruncateThousands amount={proposal.votingPower} />
        </div>
      </div>
    </>
  );
};

export default VotesDisplay;
