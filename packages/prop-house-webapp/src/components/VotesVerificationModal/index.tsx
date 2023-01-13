import classes from './VotesVerificationModal.module.css';
import { SignatureState, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import EthAddress from '../EthAddress';
import { Dispatch, SetStateAction } from 'react';
import { MdOutlinePendingActions } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';

const VotesVerificationModal: React.FC<{
  displayVotesVerifModal: boolean;
  setDisplayVotesVerifModal: Dispatch<SetStateAction<boolean>>;
  proposal: StoredProposalWithVotes;
}> = props => {
  const { proposal, displayVotesVerifModal, setDisplayVotesVerifModal } = props;
  const { t } = useTranslation();

  const verifiedVotes = (
    <div className={classes.votesContainer}>
      {proposal.votes
        .filter(v => v.signatureState !== SignatureState.FAILED_VALIDATION)
        .map((vote, index) => (
          <div key={index} className={classes.votesRow}>
            <div className={classes.voteRowTitle}>
              {`${vote.weight}  ${vote.weight === 1 ? t('vote') : t('votes')} ${t('by')}`}
              <EthAddress
                address={vote.address}
                hideDavatar={true}
                className={classes.vRowFontSize}
              />
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
        subtitle={`${proposal.voteCount} ${
          Number(proposal.voteCount) === 1 ? t('vote') : t('votes')
        } ${t('haveBeenCast')}`}
        body={verifiedVotes}
        showModal={displayVotesVerifModal}
        setShowModal={setDisplayVotesVerifModal}
      />
    </div>
  );
};

export default VotesVerificationModal;
