import React, { Dispatch, SetStateAction, useState } from 'react';
import Button, { ButtonColor } from '../../Button';
import Modal from '../../Modal';
import TimedRound from '../TimedRoundDateSelector';
import { NewRound } from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';
import { useDispatch } from 'react-redux';
import { saveRound } from '../../../state/thunks';

const EditDatesModal: React.FC<{
  setShowDatesModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowDatesModal } = props;

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
    setShowDatesModal(false);
  };

  return (
    <Modal
      modalProps={{
        title: 'Edit round timing',
        subtitle: '',
        body: <TimedRound editMode round={editedRound} setEditedRound={setEditedRound} />,
        setShowModal: setShowDatesModal,
        button: (
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
        ),
      }}
    />
  );
};

export default EditDatesModal;
