import React, { Dispatch, SetStateAction } from 'react';
import classes from './ErrorModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';

const ErrorModal: React.FC<{
  showErrorModal: boolean;
  setShowErrorModal: Dispatch<SetStateAction<boolean>>;
  title: string;
  message: string;
  image: string;
}> = props => {
  const { showErrorModal, setShowErrorModal, title, message, image } = props;

  function closeModal() {
    setShowErrorModal(false);
  }

  return (
    <Modal isOpen={showErrorModal} onRequestClose={closeModal} className={clsx(classes.modal)}>
      <div className={classes.container}>
        <div className={classes.imgContainer}>
          <img src={`/${image}`} alt={image} />
        </div>

        <div className={classes.titleContainer}>
          <p className={classes.modalTitle}>{title}</p>
          <p className={classes.modalSubtitle}>{message}</p>
        </div>
      </div>

      <hr className={classes.divider} />

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
