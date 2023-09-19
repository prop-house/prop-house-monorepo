import classes from './VotesDisplay.module.css';
import { MdHowToVote } from 'react-icons/md';
import { useEffect, useState } from 'react';
import VotesVerificationModal from '../VotesVerificationModal';
import TruncateThousands from '../TruncateThousands';
import { useAppSelector } from '../../hooks';
import { Proposal, Vote, usePropHouse } from '@prophouse/sdk-react';

const TimedRoundPropVotesDisplay: React.FC<{ proposal: Proposal }> = props => {
  const { proposal } = props;

  const prophouse = usePropHouse();
  const [votes, setVotes] = useState<Vote[]>([]);

  // REMOVE ONCE WE HAVE GETVOTESFORPROPOSAL FUNC OIN SDK
  useEffect(() => {
    const fetchVotes = async () => {
      const votes = await prophouse.query.getVotes();
      setVotes(votes);
    };
    fetchVotes();
  });

  const [displayVotesVerifModal, setDisplayVotesVerifModal] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (votes.length > 0) setDisplayVotesVerifModal(prev => !prev);
    return;
  };

  return (
    <>
      {displayVotesVerifModal && (
        <VotesVerificationModal
          setDisplayVotesVerifModal={setDisplayVotesVerifModal}
          proposal={proposal}
          votes={votes}
        />
      )}
      <div onClick={e => handleClick(e)}>
        <div className={classes.scoreAndIcon}>
          <MdHowToVote /> <TruncateThousands amount={Number(proposal.votingPower)} />
        </div>
      </div>
    </>
  );
};

export default TimedRoundPropVotesDisplay;
