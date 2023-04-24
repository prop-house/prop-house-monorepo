import React, { Dispatch, SetStateAction, useState } from 'react';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks';
import refreshActiveProposal, { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import { useDispatch } from 'react-redux';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';
import { usePropHouse } from '@prophouse/sdk-react';

const DeleteProposalModal: React.FC<{
  id: number;
  setShowDeletePropModal: Dispatch<SetStateAction<boolean>>;
  handleClosePropModal: () => void;
  dismissModalAndRefreshProps: () => void;
}> = props => {
  const { id, setShowDeletePropModal, handleClosePropModal, dismissModalAndRefreshProps } = props;
  const { t } = useTranslation();
  const propHouse = usePropHouse();

  const [hasBeenDeleted, setHasBeenDeleted] = useState(false);
  const [errorDeleting, setErrorDeleting] = useState(false);

  const dispatch = useDispatch();

  const round = useAppSelector(state => state.propHouse.activeRound);
  const activeProposal = useAppSelector(state => state.propHouse.activeProposal);
  // const client = useRef(new PropHouseWrapper(host));

  // useEffect(() => {
  //   client.current = new PropHouseWrapper(host, signer);
  // }, [signer, host]);

  const handleDeleteProposal = async () => {
    if (!id) return;

    try {
      // TODO
      // await propHouse.round.timedFunding.cancelProposal(id);
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
              refreshActiveProposals(propHouse, round!, dispatch);
              refreshActiveProposal(propHouse, activeProposal!, dispatch);
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
