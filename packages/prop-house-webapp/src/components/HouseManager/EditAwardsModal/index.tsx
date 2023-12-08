import React, { Dispatch, SetStateAction, useState } from 'react';
import Button, { ButtonColor } from '../../Button';
import Modal from '../../Modal';
import { NewRound } from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';
import { useDispatch } from 'react-redux';
import AssetSelector from '../AssetSelector';
import { saveRound } from '../../../state/thunks';

const EditAwardsModal: React.FC<{
  setShowAwardsModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowAwardsModal } = props;

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);
  const [editedRound, setEditedRound] = useState<NewRound>(round);

  const handleEditModeSave = () => {
    const filteredAwards = editedRound.awards.filter(award => award.state === 'saved');
    const updated = {
      ...editedRound,
      numWinners: filteredAwards.length,
      awards: filteredAwards,
    };

    setEditedRound(updated);
    dispatch(saveRound(updated));
    setShowAwardsModal(false);
  };

  return (
    <Modal
      modalProps={{
        title: 'Edit awards',
        subtitle: '',
        body: <AssetSelector editMode editedRound={editedRound} setEditedRound={setEditedRound} />,
        setShowModal: setShowAwardsModal,
        button: (
          <Button
            text={'Save Changes'}
            bgColor={ButtonColor.Pink}
            onClick={handleEditModeSave}
            disabled={editedRound.numWinners < 1}
          />
        ),
      }}
    />
  );
};

export default EditAwardsModal;
