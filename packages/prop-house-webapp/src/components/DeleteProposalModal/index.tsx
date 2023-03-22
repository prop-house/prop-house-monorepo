import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { DeleteProposal } from '@nouns/prop-house-wrapper/dist/builders';
import refreshActiveProposal, { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import { useDispatch } from 'react-redux';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';
import { useSigner } from 'wagmi';

const DeleteProposalModal: React.FC<{
  id: number;
  setShowDeletePropModal: Dispatch<SetStateAction<boolean>>;
  handleClosePropModal: () => void;
  dismissModalAndRefreshProps: () => void;
}> = props => {
  const { id, setShowDeletePropModal, handleClosePropModal, dismissModalAndRefreshProps } = props;
  const { t } = useTranslation();
  const { data: signer } = useSigner();

  const [hasBeenDeleted, setHasBeenDeleted] = useState(false);
  const [errorDeleting, setErrorDeleting] = useState(false);

  const dispatch = useDispatch();

  const round = useAppSelector(state => state.propHouse.activeRound);
  const activeProposal = useAppSelector(state => state.propHouse.activeProposal);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  const handleDeleteProposal = async () => {
    if (!id) return;

    try {
      await client.current.deleteProposal(new DeleteProposal(id));
      setErrorDeleting(false);
      setHasBeenDeleted(true);
    } catch (error) {
      setErrorDeleting(true);
      console.log(error);
    }
  };

  const closeModal = () => () => setShowDeletePropModal(false);

  return (
    <Modal
      title={
        errorDeleting
          ? 'Error Deleting'
          : hasBeenDeleted
          ? 'Successfully Deleted!'
          : 'Delete your prop?'
      }
      subtitle={
        errorDeleting ? (
          'Your proposal could not be deleted. Please try again.'
        ) : hasBeenDeleted ? (
          <>
            Proposal <b>#{id}</b> has been deleted.
          </>
        ) : (
          'Are you sure you want to delete your proposal? This action cannot be undone.'
        )
      }
      image={errorDeleting ? NounImage.Computer : hasBeenDeleted ? NounImage.Trashcan : null}
      setShowModal={setShowDeletePropModal}
      onRequestClose={hasBeenDeleted ? dismissModalAndRefreshProps : closeModal}
      button={
        errorDeleting ? (
          <Button
            text={t('Close')}
            bgColor={ButtonColor.White}
            onClick={() => {
              setShowDeletePropModal(false);
            }}
          />
        ) : hasBeenDeleted ? (
          <Button
            text={t('Close')}
            bgColor={ButtonColor.White}
            onClick={() => {
              setShowDeletePropModal(false);
              refreshActiveProposals(client.current, round!, dispatch);
              refreshActiveProposal(client.current, activeProposal!, dispatch);
              handleClosePropModal();
            }}
          />
        ) : (
          <Button
            text={t('Cancel')}
            bgColor={ButtonColor.White}
            onClick={() => {
              setShowDeletePropModal(false);
            }}
          />
        )
      }
      secondButton={
        errorDeleting ? (
          <Button text={'Retry'} bgColor={ButtonColor.Purple} onClick={handleDeleteProposal} />
        ) : hasBeenDeleted ? null : (
          <Button text={'Delete Prop'} bgColor={ButtonColor.Red} onClick={handleDeleteProposal} />
        )
      }
    />
  );
};

export default DeleteProposalModal;
