import classes from './VotesVerificationModal.module.css';
import EthAddress from '../EthAddress';
import { Dispatch, SetStateAction } from 'react';
import Modal from '../Modal';
import { Proposal, Vote } from '@prophouse/sdk-react';

const VotesVerificationModal: React.FC<{
  setDisplayVotesVerifModal: Dispatch<SetStateAction<boolean>>;
  proposal: Proposal;
  votes: Vote[];
}> = props => {
  const { proposal, setDisplayVotesVerifModal, votes } = props;

  const verifiedVotes = (
    <div className={classes.votesContainer}>
      {votes.map((vote, index) => (
        <div key={index} className={classes.votesRow}>
          <div className={classes.voteRowTitle}>
            {`${vote.votingPower} FOR  ${Number(vote.votingPower) === 1 ? 'vote' : 'votes'} by `}
            <EthAddress address={vote.voter} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div onClick={e => e.stopPropagation()}>
      <Modal
        modalProps={{
          title: proposal.title,
          subtitle: `${proposal.votingPower} ${
            Number(proposal.votingPower) === 1 ? 'vote' : 'votes'
          } have been cast`,
          body: verifiedVotes,
          setShowModal: setDisplayVotesVerifModal,
        }}
      />
    </div>
  );
};

export default VotesVerificationModal;
