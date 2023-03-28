import Header from '../Header';
import Footer from '../Footer';
import NameAndDescriptionFields from '../NameAndDescriptionFields';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import { capitalize } from '../../../utils/capitalize';
import HouseSelection, { FetchedHouse } from '../HouseSelection';
import { ChainId, PropHouse } from '@prophouse/sdk';
import CreateNewHouse from '../CreateNewHouse';
import { Wallet } from 'ethers';

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

  // todo
  // todo
  // todo
  // todo
  // todo

  const propHouse = new PropHouse({
    evmChainId: ChainId.EthereumGoerli,
    evm: Wallet.createRandom(),
  });

  const [selectedHouse, setSelectedHouse] = useState<FetchedHouse | null>(null);

  const [creatingNewHouse, setCreatingNewHouse] = useState(false);
  const handleCreateNewHouseClick = () => setCreatingNewHouse(true);

  const handleHouseSelection = (house: FetchedHouse) => setSelectedHouse(house);

  return (
    <>
      {selectedHouse ? (
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
      ) : (
        <>
          {creatingNewHouse ? (
            <CreateNewHouse />
          ) : (
            <>
              <Header title="Which house is the round for?" />
              <HouseSelection
                propHouse={propHouse}
                onSelectHouse={handleHouseSelection}
                handleCreateNewHouseClick={handleCreateNewHouseClick}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default NameTheRound;
