import React from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './NoActiveHouseModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';

const NoActiveHouseModal: React.FC<{}> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={true}
      onRequestClose={() => {
        navigate(`/`);
      }}
      className={clsx(classes.modal)}
    >
      <div className={classes.container}>
        <div className={classes.imgContainer}>
          <img src="/rednoggles.png" alt="noggles" />
        </div>

        <div className={classes.titleContainer}>
          <p className={classes.modalTitle}>{t('noRoundSelected')}</p>
          <p className={classes.modalSubtitle}>{t('proposalCreation')}</p>
        </div>
      </div>

      <hr className={classes.divider} />

      <div className={classes.buttonContainer}>
        <Button
          text={t('goHome')}
          bgColor={ButtonColor.White}
          onClick={() => {
            navigate(`/`);
          }}
        />
      </div>
    </Modal>
  );
};

export default NoActiveHouseModal;
