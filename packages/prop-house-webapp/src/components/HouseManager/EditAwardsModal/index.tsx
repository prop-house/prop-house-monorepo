import React, { Dispatch, SetStateAction, useState } from 'react';
import Button, { ButtonColor } from '../../Button';
import Modal from '../../Modal';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';
import { useDispatch } from 'react-redux';
import AssetSelector, { Award } from '../AssetSelector';

const EditAwardsModal: React.FC<{
  setShowAwardsModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowAwardsModal } = props;

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);
  const [winnerCount, setWinnerCount] = useState(round.numWinners);
  const [editedAwards, setEditedAwards] = useState<Award[]>(round.awards);

  const handleEditModeSave = () => {
    if (!round.splitAwards) {
      const filteredAwards = round.awards.filter(award => award.state === 'success');
      setEditedAwards(filteredAwards);
      setWinnerCount(filteredAwards.length);
    }
    dispatch(updateRound({ ...round, awards: editedAwards, numWinners: winnerCount }));
    dispatch(checkStepCriteria());
    setShowAwardsModal(false);
  };

  return (
    <Modal
      title="Edit awards"
      subtitle=""
      body={
        <AssetSelector
          editMode
          setEditedAwards={setEditedAwards}
          winnerCount={winnerCount}
          setWinnerCount={setWinnerCount}
        />
      }
      setShowModal={setShowAwardsModal}
      button={
        <Button
          text={'Cancel'}
          bgColor={ButtonColor.Black}
          onClick={() => setShowAwardsModal(false)}
        />
      }
      secondButton={
        <Button
          text={'Save Changes'}
          bgColor={ButtonColor.Pink}
          onClick={handleEditModeSave}
          disabled={winnerCount < 1}
        />
      }
    />
  );
};

export default EditAwardsModal;
