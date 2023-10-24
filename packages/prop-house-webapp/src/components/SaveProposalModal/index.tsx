import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Button, { ButtonColor } from '../Button';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { NounImage } from '../../utils/getNounImage';
import Modal from '../Modal';
import { useEthersSigner } from '../../hooks/useEthersSigner';

const SaveProposalModal: React.FC<{
  propId: number;
  roundAddress: string;
  setShowSavePropModal: Dispatch<SetStateAction<boolean>>;
  setEditProposalMode: (e: any) => void;
  dismissModalAndRefreshProps: () => void;
}> = props => {
  const {
    propId,
    roundAddress,
    setShowSavePropModal,
    setEditProposalMode,
    dismissModalAndRefreshProps,
  } = props;

  const host = useAppSelector(state => state.configuration.backendHost);
  const round = useAppSelector(state => state.propHouse.onchainActiveRound);
  const client = useRef(new PropHouseWrapper(host));
  const signer = useEthersSigner();

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [errorSaving, setErrorSaving] = useState(false);
  // const updatedProposal = useAppSelector(state => state.editor.proposal);

  const handleSaveProposal = async () => {
    try {
      if (!propId || !roundAddress) return;

      // todo: handle updating proposal

      setErrorSaving(false);
      setHasBeenSaved(true);
    } catch (error) {
      setErrorSaving(true);
      console.log(error);
    }
  };

  const handleClose = () => {
    setShowSavePropModal(false);

    if (hasBeenSaved && round) {
      dismissModalAndRefreshProps();
      setEditProposalMode(false);
    }
  };

  return (
    <Modal
      title={
        errorSaving ? 'Error Saving' : hasBeenSaved ? 'Saved Successfully!' : 'Save this version?'
      }
      subtitle={
        errorSaving ? (
          ' Your proposal could not be saved. Please try again.'
        ) : hasBeenSaved ? (
          <>
            Proposal <b>#{propId}</b> has been updated.
          </>
        ) : (
          'By confirming, these changes will be saved and your proposal will be updated.'
        )
      }
      image={errorSaving ? NounImage.Laptop : hasBeenSaved ? NounImage.Thumbsup : null}
      setShowModal={setShowSavePropModal}
      handleClose={handleClose}
      button={
        !hasBeenSaved && (
          <Button
            text={errorSaving ? 'Retry' : 'Save Prop'}
            bgColor={ButtonColor.Purple}
            onClick={handleSaveProposal}
          />
        )
      }
    />
  );
};

export default SaveProposalModal;
