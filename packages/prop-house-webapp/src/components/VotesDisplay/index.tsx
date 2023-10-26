import classes from './VotesDisplay.module.css';
import { MdHowToVote } from 'react-icons/md';
import { useEffect, useState } from 'react';
import VotesVerificationModal from '../VotesVerificationModal';
import TruncateThousands from '../TruncateThousands';
import { Proposal, Vote, usePropHouse } from '@prophouse/sdk-react';
import { useAppSelector } from '../../hooks';

const TimedRoundPropVotesDisplay: React.FC<{ proposal: Proposal }> = props => {
  const { proposal } = props;

  const prophouse = usePropHouse();
  const round = useAppSelector(state => state.propHouse.activeRound);
  const [votes, setVotes] = useState<Vote[] | undefined>();

  useEffect(() => {
    if (!round || votes) return;
    const fetchVotes = async () =>
      setVotes(await prophouse.query.getVotesForProposal(round.address, proposal.id));
    fetchVotes();
  });

  const [displayVotesVerifModal, setDisplayVotesVerifModal] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!votes) return;
    e.stopPropagation();
    if (votes.length > 0) setDisplayVotesVerifModal(prev => !prev);
    return;
  };

  return (
    <>
      {displayVotesVerifModal && votes && (
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
