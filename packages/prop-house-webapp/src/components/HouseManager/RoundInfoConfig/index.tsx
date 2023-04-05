import Header from '../Header';
import Footer from '../Footer';
import RoundFields from '../RoundFields';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import { capitalize } from '../../../utils/capitalize';
import removeTags from '../../../utils/removeTags';
import { useEffect, useRef, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';

const RoundInfoConfig = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [title, setTitle] = useState(round.title || '');
  const [description, setDescription] = useState(round.description || '');
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const handleBlur = (field: 'title' | 'description') => {
    const value = field === 'title' ? title : description;
    const length = value === description ? descriptionLength : value.length;
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

  const handleFieldChange = (field: 'title' | 'description', value: string) => {
    errors[field] && setErrors({ ...errors, [field]: undefined });

    field === 'title' ? setTitle(value) : setDescription(value);

    dispatch(updateRound({ ...round, [field]: value }));
    dispatch(checkStepCriteria());
  };
  useEffect(() => {
    setDescriptionLength(removeTags(round.description).length);
  }, [round.description]);

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    handleFieldChange('description', value);
  };

  useEffect(() => {
    if (round.house.existingHouse || round.house.contractURI !== '') {
      return;
    } else {
      // upload contracturi to ipfs if the user is creating
      // a new house or if they have not already set one
      postContractURIToIpfs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postContractURIToIpfs = async () => {
    const contractURIObject = {
      name: round.house.title,
      description: round.house.description,
      image: round.house.image,
      external_link: `https://prop.house/${round.house.address}`,
      seller_fee_basis_points: 0,
      fee_recipient: '0x0000000000000000000000000000000000000000',
    };

    const jsonString = JSON.stringify(contractURIObject);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });

    try {
      const res = await client.current.postFile(file, file.name);

      dispatch(
        updateRound({
          ...round,
          house: {
            ...round.house,
            contractURI: `ipfs://${res.data.ipfsHash}`,
          },
        }),
      );
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Header title="What's your round about?" />
      <RoundFields
        title={title}
        description={description}
        descriptionLength={descriptionLength}
        errors={errors}
        handleBlur={handleBlur}
        handleChange={handleFieldChange}
        handleDescriptionChange={handleDescriptionChange}
      />
      <Footer />
    </>
  );
};

export default RoundInfoConfig;
