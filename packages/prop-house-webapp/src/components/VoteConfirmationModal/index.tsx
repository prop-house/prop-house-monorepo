import React, { Dispatch, SetStateAction } from 'react';
import classes from './VoteConfirmationModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import dayjs from 'dayjs';
import { useAppSelector } from '../../hooks';
import { votesRemaining } from '../../utils/votesRemaining';
import { VoteAllotment } from '../../types/VoteAllotment';

const VoteConfirmationModal: React.FC<{
  showNewModal: boolean;
  setShowNewModal: Dispatch<SetStateAction<boolean>>;
  secondBtn?: boolean;
  votingEndTime: Date;
  submitVote: () => Promise<void>;
}> = props => {
  const { showNewModal, setShowNewModal, votingEndTime, submitVote, secondBtn } = props;

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);
  const votesLeft = votesRemaining(votingPower, submittedVotes, voteAllotments);

  function closeModal() {
    setShowNewModal(false);
  }

  return (
    <Modal isOpen={showNewModal} onRequestClose={closeModal} className={clsx(classes.modal)}>
      <div className={classes.titleContainer}>
        <p className={classes.modalTitle}>
          Cast {voteAllotments.reduce((total, prop) => (total = total + prop.votes), 0)} votes?
        </p>
        <p className={classes.modalSubtitle}>
          You'll have {votesLeft} remaining to cast over the next{' '}
          {dayjs(votingEndTime).fromNow(true)}
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
          text="Nope"
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowNewModal(false);
          }}
        />

        {secondBtn && (
          <Button text="Sign &amp; Submit" bgColor={ButtonColor.Purple} onClick={submitVote} />
        )}
      </div>
    </Modal>
  );
};

export default VoteConfirmationModal;
