import React, { Dispatch, SetStateAction } from 'react';
import classes from './SuccessVotingModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';

const SuccessVotingModal: React.FC<{
  showSuccessVotingModal: boolean;
  numPropsVotedFor: number;
  setShowSuccessVotingModal: Dispatch<SetStateAction<boolean>>;
  signerIsContract: boolean;
}> = props => {
  const { showSuccessVotingModal, setShowSuccessVotingModal, numPropsVotedFor, signerIsContract } = props;
  const { t } = useTranslation();

  const eoaSignerMsg = `${t('youveSuccessfullyVotedFor')} ${numPropsVotedFor} ${numPropsVotedFor === 1 ? t('prop') : t('props')
    }!`;
  const contractSignerMsg = `${t('youveSubmittedVotesFor')} ${numPropsVotedFor === 1 ? t('prop') : t('props')
    }. ${t('theyWillBeCounted')}.`;

  return (
    <Modal
      isOpen={showSuccessVotingModal}
      onRequestClose={() => setShowSuccessVotingModal(false)}
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
            setShowSuccessVotingModal(false);
          }}
        />
      </div>
    </Modal>
  );
};

export default SuccessVotingModal;
