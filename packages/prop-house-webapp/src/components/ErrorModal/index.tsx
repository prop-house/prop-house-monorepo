import React from 'react';
import classes from './ErrorModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';

const ErrorModal: React.FC<{
  showErrorModal: boolean;
  setShowErrorModal: any;
  title: string;
  message: string;
}> = props => {
  const { showErrorModal, setShowErrorModal, title, message } = props;

  function closeModal() {
    setShowErrorModal(false);
  }

  return (
    <Modal isOpen={showErrorModal} onRequestClose={closeModal} className={clsx(classes.modal)}>
      <div className={classes.errorContainer}>
        <div className={classes.imgContainer}>
          <img src="/doom.png" alt="doom-noun" />
        </div>

        <div>
          <p className={classes.modalTitle}>{title}</p>
          <p className={classes.modalSubtitle}>{message}</p>
        </div>
      </div>

      <div className={classes.buttonContainer}>
        <Button
          text="Close"
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowErrorModal(false);
          }}
        />
      </div>
    </Modal>
  );
};

export default ErrorModal;
