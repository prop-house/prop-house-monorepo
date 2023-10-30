import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Button, { ButtonColor } from '../Button';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { DeleteProposal } from '@nouns/prop-house-wrapper/dist/builders';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';
import { useEthersSigner } from '../../hooks/useEthersSigner';

const DeleteProposalModal: React.FC<{
  id: number;
  setShowDeletePropModal: Dispatch<SetStateAction<boolean>>;
  dismissModalAndRefreshProps: () => void;
}> = props => {
  const { id, setShowDeletePropModal, dismissModalAndRefreshProps } = props;

  const signer = useEthersSigner();

  const [hasBeenDeleted, setHasBeenDeleted] = useState(false);
  const [errorDeleting, setErrorDeleting] = useState(false);

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

  const handleClose = () => {
    setShowDeletePropModal(false);

    if (hasBeenDeleted) dismissModalAndRefreshProps();
  };

  return (
    <Modal
      modalProps={{
        title: errorDeleting
          ? 'Error Deleting'
          : hasBeenDeleted
          ? 'Successfully Deleted!'
          : 'Delete your prop?',
        subtitle: errorDeleting ? (
          'Your proposal could not be deleted. Please try again.'
        ) : hasBeenDeleted ? (
          <>
            Proposal <b>#{id}</b> has been deleted.
          </>
        ) : (
          'Are you sure you want to delete your proposal? This action cannot be undone.'
        ),
        image: errorDeleting
          ? { src: NounImage.Computer, alt: 'Computer' }
          : hasBeenDeleted
          ? { src: NounImage.Trashcan, alt: 'Trashcan' }
          : null,
        setShowModal: setShowDeletePropModal,
        handleClose: handleClose,
        button: !hasBeenDeleted && (
          <Button
            text={errorDeleting ? 'Retry' : 'Delete Prop'}
            bgColor={errorDeleting ? ButtonColor.Purple : ButtonColor.Red}
            onClick={handleDeleteProposal}
          />
        ),
      }}
    />
  );
};

export default DeleteProposalModal;
