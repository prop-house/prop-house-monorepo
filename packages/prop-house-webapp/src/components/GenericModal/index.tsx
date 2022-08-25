import React from 'react';
import classes from './GenericModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import diffTime from '../../utils/diffTime';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';

const GenericModal: React.FC<{
  showNewModal: boolean;
  setShowNewModal: any;
  secondBtn?: boolean;
  propsWithVotes: any[];
  votesLeft: number | undefined;
  votingEndTime: any;
}> = props => {
  const { showNewModal, setShowNewModal, propsWithVotes, votesLeft, votingEndTime, secondBtn } =
    props;

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
          You'll have {votesLeft} remaining to cast over the next {diffTime(votingEndTime)}
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
          // disabled={imageLink === ''}
          onClick={() => {
            setShowNewModal(false);
          }}
        />

        {secondBtn && (
          <Button
            text="Sign & Submit"
            bgColor={ButtonColor.Purple}
            // disabled={imageLink === ''}
            onClick={() => {
              setShowNewModal(false);
            }}
          />
        )}
      </div>
      {/* <div className={classes.imageLinkInfo}>
        <button className={classes.closeButton} onClick={closeModal}>
          <img src={xIcon} alt="Button to close modal" />
        </button>
        <h3>{`title`}</h3>

        <p>{`subtitle`}</p>
      </div>

      <Button
        text={`t('submit')`}
        bgColor={ButtonColor.Green}
        // disabled={imageLink === ''}
        onClick={() => {
          setShowNewModal(false);
        }}
      /> */}
    </Modal>
  );
};

export default GenericModal;
