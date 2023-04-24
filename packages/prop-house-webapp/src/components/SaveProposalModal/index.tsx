import React, { Dispatch, SetStateAction, useState } from 'react';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import refreshActiveProposal, { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import { NounImage } from '../../utils/getNounImage';
import Modal from '../Modal';
import { usePropHouse } from '@prophouse/sdk-react';

const SaveProposalModal: React.FC<{
  propId: number;
  roundAddress: string;
  setShowSavePropModal: Dispatch<SetStateAction<boolean>>;
  setEditProposalMode: (e: any) => void;
  handleClosePropModal: () => void;
  dismissModalAndRefreshProps: () => void;
}> = props => {
  const {
    propId,
    roundAddress,
    setShowSavePropModal,
    setEditProposalMode,
    handleClosePropModal,
    dismissModalAndRefreshProps,
  } = props;
  const { t } = useTranslation();

  const round = useAppSelector(state => state.propHouse.activeRound);
  const propHouse = usePropHouse();

  const [hasBeenSaved, setHasBeenSaved] = useState(false);
  const [errorSaving, setErrorSaving] = useState(false);
  const updatedProposal = useAppSelector(state => state.editor.proposal);

  const dispatch = useAppDispatch();
  const activeProposal = useAppSelector(state => state.propHouse.activeProposal);

  const handleSaveProposal = async () => {
    try {
      if (!propId || !roundAddress) return;

      // TODO
      // await client.current.updateProposal(
      //   new UpdatedProposal(
      //     propId,
      //     updatedProposal.title,
      //     updatedProposal.what,
      //     updatedProposal.tldr,
      //     roundId,
      //     updatedProposal.reqAmount,
      //   ),
      // );
      setErrorSaving(false);
      setHasBeenSaved(true);
    } catch (error) {
      setErrorSaving(true);
      console.log(error);
    }
  };

  const closeModal = () => () => setShowSavePropModal(false);

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
      onRequestClose={hasBeenSaved ? dismissModalAndRefreshProps : closeModal}
      button={
        errorSaving ? (
          <Button
            text={t('Close')}
            bgColor={ButtonColor.White}
            onClick={() => {
              setShowSavePropModal(false);
            }}
          />
        ) : hasBeenSaved && round ? (
          <Button
            text={t('Close')}
            bgColor={ButtonColor.White}
            onClick={() => {
              setShowSavePropModal(false);
              refreshActiveProposals(propHouse, round, dispatch);
              refreshActiveProposal(propHouse, activeProposal!, dispatch);
              setEditProposalMode(false);
              handleClosePropModal();
            }}
          />
        ) : (
          <Button
            text={t('Cancel')}
            bgColor={ButtonColor.White}
            onClick={() => {
              setShowSavePropModal(false);
            }}
          />
        )
      }
      secondButton={
        errorSaving ? (
          <Button text={'Retry'} bgColor={ButtonColor.Purple} onClick={handleSaveProposal} />
        ) : hasBeenSaved ? null : (
          <Button text={'Save Prop'} bgColor={ButtonColor.Purple} onClick={handleSaveProposal} />
        )
      }
    />
  );
};

export default SaveProposalModal;
