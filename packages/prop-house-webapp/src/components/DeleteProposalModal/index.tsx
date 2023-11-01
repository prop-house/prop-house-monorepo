import React, { Dispatch, SetStateAction, useState } from 'react';
import Button, { ButtonColor } from '../Button';
import { useAppDispatch, useAppSelector } from '../../hooks';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';
import { usePropHouse } from '@prophouse/sdk-react';
import LoadingIndicator from '../LoadingIndicator';
import { setModalActive, setOnChainActiveProposals } from '../../state/slices/propHouse';

const DeleteProposalModal: React.FC<{
  id: number;
  setShowDeletePropModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { id, setShowDeletePropModal } = props;

  const propHouse = usePropHouse();
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const dispatch = useAppDispatch();

  const [hasBeenDeleted, setHasBeenDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorDeleting, setErrorDeleting] = useState(false);

  const handleDeleteProposal = async () => {
    if (!round) return;

    try {
      setDeleting(true);
      const res = await propHouse.round.timed.cancelProposalViaSignature({
        round: round.address,
        proposalId: id,
      });
      setHasBeenDeleted(true);
      setDeleting(false);
    } catch (e) {
      console.log(e);
      setDeleting(false);
      setErrorDeleting(true);
    }
  };

  const handleClose = () => {
    if (!proposals) return;
    const updatedProps = proposals.filter(p => p.id !== id);
    dispatch(setOnChainActiveProposals(updatedProps));
    setShowDeletePropModal(false);
    dispatch(setModalActive(false));
  };

  return (
    <Modal
      modalProps={{
        title: deleting
          ? 'Deleting'
          : errorDeleting
          ? 'Error Deleting'
          : hasBeenDeleted
          ? 'Successfully Deleted!'
          : 'Delete your prop?',
        subtitle: deleting ? (
          'Sending the prop to the void...'
        ) : errorDeleting ? (
          'Your proposal could not be deleted. Please try again.'
        ) : hasBeenDeleted ? (
          <>
            Proposal <b>#{id}</b> has been deleted.
          </>
        ) : (
          'Are you sure you want to delete your proposal? This action cannot be undone.'
        ),
        image: errorDeleting ? NounImage.Computer : hasBeenDeleted ? NounImage.Trashcan : null,
        setShowModal: setShowDeletePropModal,
        handleClose: handleClose,
        body: deleting && <LoadingIndicator />,
        button: !hasBeenDeleted && !deleting && (
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
