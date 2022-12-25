import classes from './VotesVerificationModal.module.css';
import Modal from 'react-modal';
import Button from '../Button';
import { ButtonColor } from '../Button';
import { SignatureState, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import EthAddress from '../EthAddress';
import { Dispatch, SetStateAction } from 'react';
import { MdOutlinePendingActions } from 'react-icons/md';
import { useTranslation } from 'react-i18next';

const VotesVerificationModal: React.FC<{
  setDisplay: Dispatch<SetStateAction<boolean>>;
  proposal: StoredProposalWithVotes;
}> = props => {
  const { proposal, setDisplay } = props;
  const { t } = useTranslation();

  return (
    <div onClick={e => e.stopPropagation()}>
      <Modal
        isOpen={true}
        onRequestClose={() => setDisplay(false)}
        className={classes.modal}
        ariaHideApp={false}
      >
        <div className={classes.container}>
          <div className={classes.headerContainer}>
            <div className={classes.propTitle}>{proposal.title}</div>
            <div className={classes.votesSubtitle}>{`${proposal.voteCount} ${
              Number(proposal.voteCount) === 1 ? t('vote') : t('votes')
            } ${t('haveBeenCast')}`}</div>
          </div>

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
        </div>

        <div className={classes.buttonContainer}>
          <Button text={t('close')} bgColor={ButtonColor.White} onClick={() => setDisplay(false)} />
        </div>
      </Modal>
    </div>
  );
};

export default VotesVerificationModal;
