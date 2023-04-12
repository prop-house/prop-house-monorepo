import React, { Dispatch, SetStateAction, useState } from 'react';
import Button, { ButtonColor } from '../../Button';
import Modal from '../../Modal';
import TimedRound from '../TimedRound';
import { NewRound } from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';
import { useDispatch } from 'react-redux';
import { saveRound } from '../../../state/thunks';

const EditDatesModal: React.FC<{
  setShowEditDatesModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowEditDatesModal } = props;

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);
  const [editedRound, setEditedRound] = useState<NewRound>(round);

  const handleDateSave = () => {
    const updated = {
      ...editedRound,
      proposalPeriodStartUnixTimestamp: editedRound.proposalPeriodStartUnixTimestamp,
      proposalPeriodDurationSecs: editedRound.proposalPeriodDurationSecs,
      votePeriodDurationSecs: editedRound.votePeriodDurationSecs,
    };

    setEditedRound!(updated);
    dispatch(saveRound(updated));
    setShowEditDatesModal(false);
  };

  return (
    <Modal
      title="Edit round timing"
      subtitle=""
      body={<TimedRound editMode round={editedRound} setEditedRound={setEditedRound} />}
      setShowModal={setShowEditDatesModal}
      button={
        <Button
          text={'Cancel'}
          bgColor={ButtonColor.Black}
          onClick={() => setShowEditDatesModal(false)}
        />
      }
      secondButton={
        <Button
          text={'Save Changes'}
          bgColor={ButtonColor.Pink}
          onClick={handleDateSave}
          disabled={
            editedRound.proposalPeriodStartUnixTimestamp === 0 ||
            editedRound.proposalPeriodDurationSecs === 0 ||
            editedRound.votePeriodDurationSecs === 0
          }
        />
      }
    />
  );
};

export default EditDatesModal;
