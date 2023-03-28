import classes from './CreateNewHouse.module.css';
import Header from '../Header';
import NewHouseFields from '../NewHouseFields';
import { useState } from 'react';
import { capitalize } from '../../../utils/capitalize';
import Group from '../Group';
import Button, { ButtonColor } from '../../Button';
import InstructionBox from '../InstructionBox';
import Divider from '../../Divider';

const CreateNewHouse = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   // if (event.target.files && event.target.files[0]) {
  //   //   setNewHouseImage(event.target.files[0]);
  //   // }
  //   return;
  // };

  // const handleNewHouseSubmit = () => {
  //   if (title && description) {
  //     const newHouse: House = {
  //       // Add required properties for the House interface
  //       name: title,
  //       description: description,
  //       image: '',
  //       // image: newHouseImage,
  //     };
  //     handleHouseSelection(newHouse);
  //   }
  // };

  const handleFieldChange = (field: 'title' | 'description', value: string) => {
    errors[field] && setErrors({ ...errors, [field]: undefined });

    field === 'title' ? setTitle(value) : setDescription(value);

    // dispatch(updateRound({ ...round, [field]: value }));
    // dispatch(checkStepCriteria());
  };

  const handleBlur = (field: 'title' | 'description') => {
    const value = field === 'title' ? title : description;
    const minLen = field === 'title' ? 3 : 30;
    const maxLen = field === 'title' ? 255 : undefined;
    const error =
      value && value.length < minLen
        ? `${capitalize(field)} must be at least ${minLen} characters.`
        : maxLen && value.length > maxLen
        ? `${capitalize(field)} must be less than ${maxLen} characters.`
        : undefined;

    setErrors({ ...errors, [field]: error });
  };

  const handledescriptionChange = (value: string) => {
    setDescription(value);
    handleFieldChange('description', value);
  };

  return (
    <>
      <Header title="Create your house" />
      <Group row gap={18}>
        <Group gap={18}>
          <div className={classes.imgContainer}>
            <img className={classes.img} src="/manager/newImage.png" alt="Create a new house" />{' '}
          </div>
          <Button text="Upload Image" bgColor={ButtonColor.White} />{' '}
        </Group>

        <NewHouseFields
          title={title}
          description={description}
          errors={errors}
          handleBlur={handleBlur}
          handleChange={handleFieldChange}
          handleDescriptionChange={handledescriptionChange}
        />
      </Group>

      <Divider />

      <InstructionBox
        title="House NFT"
        text="This is your ownership token for the House. You can send it to anyone, and is there anything else about to we need to say here?"
        image="/manager/newImage.png"
      />
    </>
  );
};

export default CreateNewHouse;
