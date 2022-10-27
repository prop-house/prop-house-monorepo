import React, { Dispatch, SetStateAction } from 'react';
import classes from './SuccessModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';

const SuccessModal: React.FC<{
  showSuccessModal: boolean;
  numPropsVotedFor: number;
  setShowSuccessModal: Dispatch<SetStateAction<boolean>>;
  signerIsContract: boolean;
}> = props => {
  const { showSuccessModal, setShowSuccessModal, numPropsVotedFor, signerIsContract } = props;
  const { t } = useTranslation();

  const eoaSignerMsg = `${t('youveSuccessfullyVotedFor')} ${numPropsVotedFor} ${
    numPropsVotedFor === 1 ? t('prop') : t('props')
  }!`;
  const contractSignerMsg = `${t('youveSubmittedVotesFor')} ${
    numPropsVotedFor === 1 ? t('prop') : t('props')
  }. ${t('theyWillBeCounted')}.`;

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
          <p className={classes.modalTitle}>{t('veryNounish')}</p>
          <p className={classes.modalSubtitle}>
            {signerIsContract ? contractSignerMsg : eoaSignerMsg}
          </p>
        </div>
      </div>

      <hr className={classes.divider} />

      <div className={classes.buttonContainer}>
        <Button
          text={t('close')}
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
