import React from 'react';
import classes from './VotingModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import dayjs from 'dayjs';

const VotingModal: React.FC<{
  showNewModal: boolean;
  setShowNewModal: any;
  secondBtn?: boolean;
  propsWithVotes: any[];
  votesLeft: number | undefined;
  votingEndTime: any;
  submitVote: any;
}> = props => {
  const {
    showNewModal,
    setShowNewModal,
    propsWithVotes,
    votesLeft,
    votingEndTime,
    submitVote,
    secondBtn,
  } = props;

  function closeModal() {
    setShowNewModal(false);
  }

  return (
    <Modal isOpen={showNewModal} onRequestClose={closeModal} className={clsx(classes.modal)}>
      <div className={classes.titleContainer}>
        <p className={classes.modalTitle}>
          Cast {propsWithVotes.reduce((total, prop) => (total = total + prop.votes), 0)} votes?
        </p>
        <p className={classes.modalSubtitle}>
          You'll have {votesLeft} remaining to cast over the next{' '}
          {dayjs(votingEndTime).fromNow(true)}
        </p>
      </div>

      <hr className={classes.divider} />

      <div className={classes.props}>
        {propsWithVotes.map((prop: StoredProposalWithVotes) => (
          <div key={prop.id} className={classes.propCopy}>
            <p className={classes.voteCount}>{prop.votes}</p>
            <hr className={classes.line} />
            <p className={classes.propTitle}>{prop.title}</p>
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

export default VotingModal;
