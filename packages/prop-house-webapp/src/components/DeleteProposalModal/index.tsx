import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import classes from './DeleteProposalModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import Divider from '../Divider';
import { useTranslation } from 'react-i18next';
import { useEthers } from '@usedapp/core';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { DeleteProposal } from '@nouns/prop-house-wrapper/dist/builders';
import refreshActiveProposal, { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import { useDispatch } from 'react-redux';

const DeleteProposalModal: React.FC<{
  id: number;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setEditProposalMode: (e: any) => void;
  handleClosePropModal: () => void;
}> = props => {
  const { id, showModal, setShowModal, setEditProposalMode, handleClosePropModal } = props;
  const { t } = useTranslation();

  const [hasBeenDeleted, setHasBeenDeleted] = useState(false);
  const [errorDeleting, setErrorDeleting] = useState(false);

  const dispatch = useDispatch();
  const { library } = useEthers();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const round = useAppSelector(state => state.propHouse.activeRound);
  const activeProposal = useAppSelector(state => state.propHouse.activeProposal);

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  const handleDeleteProposal = async () => {
    if (!id) return;

    try {
      await client.current.deleteProposal(new DeleteProposal(id));
      setHasBeenDeleted(true);
    } catch (error) {
      setErrorDeleting(true);
      console.log(error);
    }
  };

  return (
    <Modal isOpen={showModal} onRequestClose={() => setShowModal(false)} className={clsx(classes.modal)}>
      {!hasBeenDeleted ?
        (
          <>
            <div className={classes.titleContainer}>
              <p className={classes.modalTitle}>Delete your prop?</p>
              <p className={classes.modalSubtitle}>
                Are you sure you want to delete your proposal? This action cannot be undone.
              </p>
            </div>
            <Divider />
            <div className={classes.buttonContainer}>
              <Button
                text={t('Cancel')}
                bgColor={ButtonColor.White}
                onClick={() => {
                  setShowModal(false);
                }} />

              <Button
                text={'Delete Prop'}
                bgColor={ButtonColor.Red}
                onClick={handleDeleteProposal} />
            </div>
          </>
        ) : !errorDeleting ? (
          <>
            <div className={classes.titleContainer}>
              <p className={classes.modalTitle}>{"Successfully Deleted!"}</p>
              <p className={classes.modalSubtitle}>
                {`Proposal #${id} has been deleted.`}
              </p>
            </div>
            <Divider />
            <div className={classes.buttonContainer}>
              <Button
                text={t('Close')}
                bgColor={ButtonColor.White}
                onClick={() => {
                  setShowModal(false);
                  refreshActiveProposals(client.current, round!.id, dispatch)
                  refreshActiveProposal(client.current, activeProposal!, dispatch);
                  setEditProposalMode(false);
                  handleClosePropModal();
                }} />
            </div>
          </>
        ) : (
          <>
            <div className={classes.titleContainer}>
              <p className={classes.modalTitle}>{"Error Deleting"}</p>
              <p className={classes.modalSubtitle}>
                {"Your proposal could not be deleted. Please try again."}
              </p>
            </div>
            <Divider />
            <div className={classes.buttonContainer}>
              <Button
                text={t('Close')}
                bgColor={ButtonColor.White}
                onClick={() => {
                  setShowModal(false);
                  setEditProposalMode(false);
                }} />
            </div>
          </>
        )
      }
    </Modal>
  );
};

export default DeleteProposalModal;
