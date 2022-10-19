import React from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './NoActiveHouseModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';

const NoActiveHouseModal: React.FC<{}> = () => {
  const navigate = useNavigate();

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
          <p className={classes.modalTitle}>No active house</p>
          <p className={classes.modalSubtitle}>
            Proposal creation can only be done via a round page. Check for open funding rounds
            within the houses.
          </p>
        </div>
      </div>

      <hr className={classes.divider} />

      <div className={classes.buttonContainer}>
        <Button
          text="Go Home"
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
