import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Button, { ButtonColor } from '../../Button';
import Modal from '../../Modal';
import { capitalize } from '../../../utils/capitalize';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';
import { useDispatch } from 'react-redux';
import RoundFields from '../RoundFields';
import removeTags from '../../../utils/removeTags';

const EditNameDescriptionModal: React.FC<{
  setShowEditNameModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowEditNameModal } = props;

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleNameSave = () => {
    dispatch(updateRound({ ...round, title: editedTitle, description: editedDescription }));
    dispatch(checkStepCriteria());
    setShowEditNameModal(false);
  };

  const [editedTitle, setEditedTitle] = useState(round.title || '');
  const [editedDescription, setEditedDescription] = useState(round.description || '');
  const [descriptionLength, setDescriptionLength] = useState(0);

  const handleTitleChange = (field: 'title' | 'description', value: string) => {
    field === 'title' ? setEditedTitle(value) : setEditedDescription(value);
  };
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const handleBlur = (field: 'title' | 'description') => {
    const value = field === 'title' ? editedTitle : editedDescription;
    const length = value === editedDescription ? descriptionLength : value.length;
    const minLen = field === 'title' ? 5 : 20;
    const maxLen = field === 'title' ? 255 : undefined;
    const error =
      length < minLen
        ? `${capitalize(field)} must be at least ${minLen} characters.`
        : maxLen && length > maxLen
        ? `${capitalize(field)} must be less than ${maxLen} characters.`
        : undefined;

    setErrors({ ...errors, [field]: error });
  };

  useEffect(() => {
    setDescriptionLength(removeTags(round.description).length);
  }, [round.description]);

  const handleDescriptionChange = (value: string) => setEditedDescription(value);

  return (
    <Modal
      title="Edit round name and description"
      subtitle=""
      body={
        <RoundFields
          title={editedTitle}
          description={editedDescription}
          descriptionLength={descriptionLength}
          errors={errors}
          handleBlur={handleBlur}
          handleChange={handleTitleChange}
          handleDescriptionChange={handleDescriptionChange}
        />
      }
      setShowModal={setShowEditNameModal}
      button={
        <Button
          text={'Cancel'}
          bgColor={ButtonColor.Black}
          onClick={() => {
            setEditedTitle(round.title || '');
            setEditedDescription(round.description || '');
            setShowEditNameModal(false);
          }}
        />
      }
      secondButton={
        <Button
          text={'Save Changes'}
          bgColor={ButtonColor.Pink}
          onClick={handleNameSave}
          disabled={
            !(
              5 <= editedTitle.length &&
              editedTitle.length <= 255 &&
              20 <= editedDescription.length
            )
          }
        />
      }
    />
  );
};

export default EditNameDescriptionModal;
