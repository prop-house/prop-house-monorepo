import React from 'react';
import classes from './SuccessModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';

const SuccessModal: React.FC<{
  showSuccessModal: boolean;
  setShowSuccessModal: any;
  numOfProps: number;
}> = props => {
  const { showSuccessModal, setShowSuccessModal, numOfProps } = props;

  function closeModal() {
    setShowSuccessModal(false);
  }

  return (
    <Modal isOpen={showSuccessModal} onRequestClose={closeModal} className={clsx(classes.modal)}>
      <div className={classes.container}>
        <div className={classes.imgContainer}>
          <img src="/rednoggles.png" alt="noggles" />
        </div>

        <div className={classes.titleContainer}>
          <p className={classes.modalTitle}>very nounish</p>
          <p className={classes.modalSubtitle}>
            You've successfully voted for {numOfProps} {numOfProps === 1 ? 'prop' : 'props'}!
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
