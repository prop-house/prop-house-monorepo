import React, { Dispatch, SetStateAction } from 'react';
import classes from './SuccessModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';

const SuccessModal: React.FC<{
  showSuccessModal: boolean;
  numPropsVotedFor: number;
  setShowSuccessModal: Dispatch<SetStateAction<boolean>>;
  signerIsContract: boolean;
}> = props => {
  const { showSuccessModal, setShowSuccessModal, numPropsVotedFor, signerIsContract } = props;

  const eoaSignerMsg = `You've successfully voted for ${numPropsVotedFor} ${
    numPropsVotedFor === 1 ? 'prop' : 'props'
  }!`;
  const contractSignerMsg = `You've submitted votes for ${numPropsVotedFor} props. They will be counted automagically once your Gnosis Safe transaction is confirmed.`;

  return (
    <Modal
      isOpen={showSuccessModal}
      onRequestClose={() => setShowSuccessModal(false)}
      className={clsx(classes.modal)}
    >
      <div className={classes.container}>
        <div className={classes.imgContainer}>
          <img src="/rednoggles.png" alt="noggles" />
        </div>

        <div className={classes.titleContainer}>
          <p className={classes.modalTitle}>very nounish</p>
          <p className={classes.modalSubtitle}>
            {signerIsContract ? contractSignerMsg : eoaSignerMsg}
          </p>
        </div>
      </div>

      <hr className={classes.divider} />

      <div className={classes.buttonContainer}>
        <Button
          text="Close"
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowSuccessModal(false);
          }}
        />
      </div>
    </Modal>
  );
};

export default SuccessModal;
