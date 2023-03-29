import classes from './CreateNewHouse.module.css';
import HouseFields from '../HouseFields';
import { useEffect, useRef, useState } from 'react';
import { capitalize } from '../../../utils/capitalize';
import Group from '../Group';
import Button, { ButtonColor } from '../../Button';
import InstructionBox from '../InstructionBox';
import Divider from '../../Divider';
import { useDispatch } from 'react-redux';
import { updateRound, checkStepCriteria } from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';
import validFileType from '../../../utils/validFileType';
import { useSigner } from 'wagmi';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import buildIpfsPath from '../../../utils/buildIpfsPath';
import changeFileExtension from '../../../utils/changeFileExtension';
import removeTags from '../../../utils/removeTags';

const CreateNewHouse = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const [title, setTitle] = useState(round.house.title || '');
  const [description, setDescription] = useState(round.house.description || '');
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const [imageError, setImageError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { data: signer } = useSigner();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    setLoading(true);

    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!validFileType(file)) {
      let fileExtension = changeFileExtension(file.type.split('/')[1]);
      setImageError(`${fileExtension} files are not supported`);
      setLoading(false);
      return;
    }

    try {
      const res = await client.current.postFile(file, file.name);
      const image = buildIpfsPath(res.data.ipfsHash);

      dispatch(updateRound({ ...round, house: { ...round.house, image } }));
      dispatch(checkStepCriteria());
      setImageError(null);
    } catch {
      setImageError('error uploading file');
    }
    setLoading(false);
  };

  const handleBlur = (field: 'title' | 'description') => {
    const value = field === 'title' ? title : description;
    const length = value === description ? descriptionLength : value.length;
    const minLen = field === 'title' ? 3 : 20;
    const maxLen = field === 'title' ? 255 : undefined;

    if (length === 0) {
      setErrors({ ...errors, [field]: undefined });
      return;
    }

    const error =
      length < minLen
        ? `${capitalize(field)} must be at least ${minLen} characters.`
        : maxLen && length > maxLen
        ? `${capitalize(field)} must be less than ${maxLen} characters.`
        : undefined;

    setErrors({ ...errors, [field]: error });
  };

  const handleFieldChange = (field: 'title' | 'description', value: string) => {
    errors[field] && setErrors({ ...errors, [field]: undefined });

    field === 'title' ? setTitle(value) : setDescription(value);

    dispatch(updateRound({ ...round, house: { ...round.house, [field]: value } }));
    dispatch(checkStepCriteria());
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    handleFieldChange('description', value);
  };

  useEffect(() => {
    setDescriptionLength(removeTags(round.house.description).length);
  }, [round.house.description]);

  return (
    <>
      <Group row gap={18} classNames={classes.container}>
        <Group gap={18} classNames={classes.upload}>
          <div className={classes.imgContainer}>
            <img
              className={classes.img}
              src={
                loading
                  ? '/manager/loading.gif'
                  : round.house.image
                  ? round.house.image
                  : '/manager/newImage.png'
              }
              alt="houseImage"
            />{' '}
          </div>
          <input
            type="file"
            id="fileInput"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Group gap={4}>
            <Button
              onClick={() => document.getElementById('fileInput')?.click()}
              text="Upload Image"
              bgColor={ButtonColor.White}
            />{' '}
            {imageError && <p className={classes.error}>{imageError}</p>}
          </Group>
        </Group>

        <HouseFields
          title={title}
          description={description}
          errors={errors}
          descriptionLength={descriptionLength}
          handleBlur={handleBlur}
          handleChange={handleFieldChange}
          handleDescriptionChange={handleDescriptionChange}
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
