import Header from '../Header';
import Footer from '../Footer';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import HouseSelection, { FetchedHouse } from '../HouseSelection';
import CreateNewHouse from '../CreateNewHouse';
import { usePropHouse } from '@prophouse/sdk-react';

const HouseInfoConfig = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);
  const propHouse = usePropHouse();

  const handleCreateNewHouse = () => {
    dispatch(updateRound({ ...round, house: { ...round.house, existingHouse: false } }));
    dispatch(checkStepCriteria());
  };

  const handleHouseSelection = (house: FetchedHouse) => {
    if (house.metadata) {
      const updated = {
        ...round,
        house: {
          ...round.house,
          title: house.metadata.name as string,
          description: house.metadata.description as string,
          image: house.metadata.imageURI as string,
          address: house.id,
        },
      };

      dispatch(updateRound(updated));
      dispatch(checkStepCriteria());
    }
  };

  return (
    <>
      {round.house.existingHouse ? (
        <>
          <Header title="Which house is the round for?" />
          <HouseSelection
            propHouse={propHouse}
            onSelectHouse={handleHouseSelection}
            handleCreateNewHouse={handleCreateNewHouse}
          />
        </>
      ) : (
        <>
          <Header title="Create your house" />
          <CreateNewHouse />
          <Footer />
        </>
      )}
    </>
  );
};

export default HouseInfoConfig;
