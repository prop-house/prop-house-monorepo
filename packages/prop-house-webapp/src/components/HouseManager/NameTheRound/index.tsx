import Header from '../Header';
import Footer from '../Footer';
import NameAndDescriptionFields from '../NameAndDescriptionFields';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import { capitalize } from '../../../utils/capitalize';

const NameTheRound = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const [title, setTitle] = useState(round.title || '');
  const [description, setDescription] = useState(round.description || '');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const handleBlur = (field: 'title' | 'description') => {
    const value = field === 'title' ? title : description;
    const minLen = field === 'title' ? 5 : 20;
    const maxLen = field === 'title' ? 255 : undefined;
    const error =
      value && value.length < minLen
        ? `${capitalize(field)} must be at least ${minLen} characters.`
        : maxLen && value.length > maxLen
        ? `${capitalize(field)} must be less than ${maxLen} characters.`
        : undefined;

    setErrors({ ...errors, [field]: error });
  };

  const handleFieldChange = (field: 'title' | 'description', value: string) => {
    errors[field] && setErrors({ ...errors, [field]: undefined });

    field === 'title' ? setTitle(value) : setDescription(value);

    dispatch(updateRound({ ...round, [field]: value }));
    dispatch(checkStepCriteria());
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    handleFieldChange('description', value);
  };

  return (
    <>
      <Header title="What's your round about?" />

      <NameAndDescriptionFields
        title={title}
        description={description}
        errors={errors}
        handleBlur={handleBlur}
        handleChange={handleFieldChange}
        handleDescriptionChange={handleDescriptionChange}
      />

      <Footer />
    </>
  );
};

export default NameTheRound;
