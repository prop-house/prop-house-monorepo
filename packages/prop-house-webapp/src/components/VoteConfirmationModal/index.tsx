import React, { Dispatch, SetStateAction } from 'react';
import classes from './VoteConfirmationModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import { useAppSelector } from '../../hooks';
import { votesRemaining } from '../../utils/votesRemaining';
import { VoteAllotment } from '../../types/VoteAllotment';
import { useTranslation } from 'react-i18next';

const VoteConfirmationModal: React.FC<{
  showNewModal: boolean;
  setShowNewModal: Dispatch<SetStateAction<boolean>>;
  secondBtn?: boolean;
  submitVote: () => Promise<void>;
}> = props => {
  const { showNewModal, setShowNewModal, submitVote, secondBtn } = props;

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);
  const votesLeft = votesRemaining(votingPower, submittedVotes, voteAllotments);
  const { t } = useTranslation();

  function closeModal() {
    setShowNewModal(false);
  }

  const totalVotesBeingSubmitted = voteAllotments.reduce(
    (total, prop) => (total = total + prop.votes),
    0,
  );

  return (
    <Modal isOpen={showNewModal} onRequestClose={closeModal} className={clsx(classes.modal)}>
      <div className={classes.titleContainer}>
        <p className={classes.modalTitle}>
          {t('cast')} {totalVotesBeingSubmitted} {totalVotesBeingSubmitted === 1 ? 'vote' : 'votes'}
          ?
        </p>
        <p className={classes.modalSubtitle}>
          {t('youllHave')} {votesLeft} {t('votesRemaining')}{' '}
        </p>
      </div>

      <hr className={classes.divider} />

      <div className={classes.props}>
        {voteAllotments.map((prop: VoteAllotment) => (
          <div key={prop.proposalId} className={classes.propCopy}>
            <p className={classes.voteCount}>{prop.votes}</p>
            <hr className={classes.line} />
            <p className={classes.propTitle}>{prop.proposalTitle}</p>
          </div>
        ))}
      </div>

      <hr className={classes.divider} />

      <div className={classes.buttonContainer}>
        <Button
          text={t('nope')}
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowNewModal(false);
          }}
        />

        {secondBtn && (
          <Button text={t('signAndSubmit')} bgColor={ButtonColor.Purple} onClick={submitVote} />
        )}
      </div>
    </Modal>
  );
};

export default VoteConfirmationModal;
