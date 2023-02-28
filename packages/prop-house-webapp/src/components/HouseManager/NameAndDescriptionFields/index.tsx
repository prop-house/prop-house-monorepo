import classes from './NameAndDescriptionFields.module.css';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import Group from '../Group';
import Text from '../Text';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { useState } from 'react';
import clsx from 'clsx';
import { capitalize } from '../../../utils/capitalize';

const NameAndDescriptionFields = () => {
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
        ? `${field} must be at least ${minLen} characters.`
        : maxLen && value.length > maxLen
        ? `${field} must be less than ${maxLen} characters.`
        : undefined;

    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (field: 'title' | 'description', value: string) => {
    // set errors
    errors[field] && setErrors({ ...errors, [field]: undefined });
    // set state
    field === 'title' ? setTitle(value) : setDescription(value);

    dispatch(updateRound({ ...round, [field]: value }));
    dispatch(checkStepCriteria());
  };

  return (
    <>
      <Group gap={8} mb={16}>
        <div className={classes.descriptionTitile}>
          <Text type="subtitle">Round name</Text>
          <Text type="body">{title.length}/255</Text>
        </div>

        <input
          className={clsx(classes.input, errors.title && classes.inputError)}
          type="text"
          placeholder={'Hack-a-thon'}
          maxLength={255}
          id="title"
          value={title}
          onChange={e => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
        />

        {errors.title && (
          <Group mt={-8}>
            <p className={classes.error}>{errors.title}</p>
          </Group>
        )}
      </Group>

      <Group gap={8}>
        <div className={classes.descriptionTitile}>
          <Text type="subtitle">Describe your round</Text>
          <Text type="body">{description.length}</Text>
        </div>

        <textarea
          className={clsx(classes.input, errors.description && classes.inputError)}
          value={description}
          onChange={e => handleChange('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          minLength={20}
          placeholder={
            'Describe the round. Think about the goals, timeline and how you will encourage builders to participate.'
          }
        />

        {errors.description && (
          <Group mt={-8}>
            <p className={classes.error}>{capitalize(errors.description)}</p>
          </Group>
        )}
      </Group>
    </>
  );
};

export default NameAndDescriptionFields;
