import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import classes from './SaveProposalModal.module.css';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import Divider from '../Divider';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { UpdatedProposal } from '@nouns/prop-house-wrapper/dist/builders';
import refreshActiveProposal, { refreshActiveProposals } from '../../utils/refreshActiveProposal';

const SaveProposalModal: React.FC<{
  propId: number;
  roundId: number;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setEditProposalMode: (e: any) => void;
  handleClosePropModal: () => void;
}> = props => {
  const { propId, roundId, showModal, setShowModal, setEditProposalMode, handleClosePropModal } = props;
  const { t } = useTranslation();

  const { library } = useEthers();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [errorSaving, setErrorSaving] = useState(false);
  const updatedProposal = useAppSelector(state => state.editor.proposal);

  const dispatch = useAppDispatch();
  const activeProposal = useAppSelector(state => state.propHouse.activeProposal);

  const handleSaveProposal = async () => {
    try {
      if (!propId || !roundId) return;

      await client.current.updateProposal(
        new UpdatedProposal(
          propId,
          updatedProposal.title,
          updatedProposal.what,
          updatedProposal.tldr,
          roundId,
        ),
      );
      setErrorSaving(false);
      setHasBeenSaved(true);
    } catch (error) {
      setErrorSaving(true);
      console.log(error);
    }
  };

  const saveConfirmationContent = (
    <>
      <div className={classes.titleContainer}>
        <p className={classes.modalTitle}>
          Save this verison?

        </p>
        <p className={classes.modalSubtitle}>
          By confirming, these changes will be saved and your proposal will be updated.
        </p>
      </div>
      <Divider />
      <div className={classes.buttonContainer}>
        <Button
          text={t('Cancel')}
          bgColor={ButtonColor.White}
          onClick={() => setShowModal(false)} />

        <Button
          text={'Save Prop'}
          bgColor={ButtonColor.Purple}
          onClick={handleSaveProposal} />
      </div>
    </>
  );
  const successfullySavedContent = (
    <>
      <div className={classes.container}>
        <div className={classes.imgContainer}>
          <img src="/heads/thumbsup.png" alt="thumbsup" />
        </div>

        <div className={classes.titleContainer}>
          <p className={classes.modalTitle}>Saved Successfully!</p>

          <p className={classes.modalSubtitle}>Proposal <b>#{propId}</b> has been updated.</p>
        </div>
      </div>

      <Divider />

      <Button
        text={t('Close')}
        bgColor={ButtonColor.White}
        onClick={() => {
          setShowModal(false);
          refreshActiveProposals(client.current, roundId, dispatch);
          refreshActiveProposal(client.current, activeProposal!, dispatch);
          setEditProposalMode(false);
          handleClosePropModal();
        }} />
    </>
  );
  const errorSavingContent = (
    <>
      <div className={classes.container}>
        <div className={classes.imgContainer}>
          <img src="/heads/laptop.png" alt="laptop" />
        </div>

        <div className={classes.titleContainer}>
          <p className={classes.modalTitle}>Error Saving</p>

          <p className={classes.modalSubtitle}>Your proposal could not be saved. Please try again.</p>
        </div>
      </div>

      <Divider />

      <div className={classes.buttonContainer}>

        <Button
          text={t('Close')}
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowModal(false);
          }}
        />

        <Button
          text={'Retry'}
          bgColor={ButtonColor.Purple}
          onClick={() => {
            handleSaveProposal();
          }}
        />
      </div>
    </>
  );

  return (
    <Modal isOpen={showModal} onRequestClose={() => setShowModal(false)} className={classes.modal}>
      {errorSaving
        ? errorSavingContent
        : hasBeenSaved
          ? successfullySavedContent
          : saveConfirmationContent}
    </Modal>
  );
};

export default SaveProposalModal;
