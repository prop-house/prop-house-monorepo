import classes from './VotesVerificationModal.module.css';
import {
  Direction,
  SignatureState,
  StoredProposalWithVotes,
  StoredVote,
} from '@nouns/prop-house-wrapper/dist/builders';
import EthAddress from '../EthAddress';
import { Dispatch, SetStateAction } from 'react';
import { MdOutlinePendingActions } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';

const VotesVerificationModal: React.FC<{
  setDisplayVotesVerifModal: Dispatch<SetStateAction<boolean>>;
  proposal: StoredProposalWithVotes;
  votes: StoredVote[];
  direction?: Direction;
}> = props => {
  const { proposal, setDisplayVotesVerifModal, votes, direction } = props;
  const { t } = useTranslation();

  const verifiedVotes = (
    <div className={classes.votesContainer}>
      {votes
        .filter(v => v.signatureState !== SignatureState.FAILED_VALIDATION)
        .map((vote, index) => (
          <div key={index} className={classes.votesRow}>
            <div className={classes.voteRowTitle}>
              {`${vote.weight} ${
                direction ? (direction === Direction.Up ? 'FOR' : 'AGAINST') : ''
              } ${vote.weight === 1 ? t('vote') : t('votes')} ${t('by')}`}
              <EthAddress address={vote.address} />
            </div>

            {vote.signatureState === SignatureState.PENDING_VALIDATION && (
              <button className={classes.verifyVoteBtn} disabled={true}>
                {t('pending')} <MdOutlinePendingActions />
              </button>
            )}
          </div>
        ))}
    </div>
  );

  return (
    <div onClick={e => e.stopPropagation()}>
      <Modal
        title={proposal.title}
        subtitle={`${proposal.voteCountFor} ${
          proposal.voteCountFor === 1 ? t('vote') : t('votes')
        } ${t('haveBeenCast')}`}
        body={verifiedVotes}
        setShowModal={setDisplayVotesVerifModal}
      />
    </div>
  );
};

export default VotesVerificationModal;
