import React, { Dispatch, SetStateAction } from 'react';
import classes from './ErrorVotingModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';

const ErrorVotingModal: React.FC<{
  showErrorVotingModal: boolean;
  setShowErrorVotingModal: Dispatch<SetStateAction<boolean>>;
  title: string;
  message: string;
  image: string;
}> = props => {
  const { showErrorVotingModal, setShowErrorVotingModal, title, message, image } = props;
  const { t } = useTranslation();

  function closeModal() {
    setShowErrorVotingModal(false);
  }

  return (
    <Modal isOpen={showErrorVotingModal} onRequestClose={closeModal} className={clsx(classes.modal)}>
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
          text={t('close')}
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowErrorVotingModal(false);
          }}
        />
      </div>
    </Modal>
  );
};

export default ErrorVotingModal;
