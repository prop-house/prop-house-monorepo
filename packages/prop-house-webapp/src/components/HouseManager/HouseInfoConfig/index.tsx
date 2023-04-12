import Header from '../Header';
import Footer from '../Footer';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { saveRound } from '../../../state/thunks';
import HouseSelection, { FetchedHouse } from '../HouseSelection';
import CreateNewHouse from '../CreateNewHouse';
import { usePropHouse } from '@prophouse/sdk-react';

const HouseInfoConfig = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);
  const propHouse = usePropHouse();

  const handleCreateNewHouse = () =>
    dispatch(saveRound({ ...round, house: { ...round.house, existingHouse: false } }));

  const handleHouseSelection = (house: FetchedHouse) => {
    if (house.metadata) {
      dispatch(
        saveRound({
          ...round,
          house: {
            ...round.house,
            title: house.metadata.name as string,
            description: house.metadata.description as string,
            image: house.metadata.imageURI as string,
            address: house.id,
          },
        }),
      );
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
