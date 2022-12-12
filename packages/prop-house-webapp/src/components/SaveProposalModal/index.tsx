import React, { Dispatch, SetStateAction } from 'react';
import classes from './SaveProposalModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import Divider from '../Divider';
import { useTranslation } from 'react-i18next';

const SaveProposalModal: React.FC<{
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { showModal, setShowModal } = props;
  const { t } = useTranslation();

  function closeModal() {
    setShowModal(false);
  }

  return (
    <Modal isOpen={showModal} onRequestClose={closeModal} className={clsx(classes.modal)}>
      <div className={classes.titleContainer}>
        <p className={classes.modalTitle}>Save this verison?</p>
        <p className={classes.modalSubtitle}>
          By confirming, these changes will be saved and your proposal will be updated.
        </p>
      </div>

      <Divider />

      <div className={classes.buttonContainer}>
        <Button
          text={t('Cancel')}
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowModal(false);
          }}
        />

        <Button
          text={'Save Prop'}
          bgColor={ButtonColor.Purple}
          onClick={() => setShowModal(false)}
        />
      </div>
    </Modal>
  );
};

export default SaveProposalModal;
