import { usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import House from '../../pages/House';
import RoundPage from '../../pages/RoundPage';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setOnchainActiveHouse, setOnchainActiveRound } from '../../state/slices/propHouse';
import LoadingIndicator from '../LoadingIndicator';

const RoundOrHouseRouter: React.FC<{}> = props => {
  const location = useLocation();
  const roundOrHouseAddress = location.pathname.substring(1).split('/')[0];

  const propHouse = usePropHouse();
  const dispatch = useAppDispatch();

  const round = useAppSelector(state => state.propHouse.onchainActiveRound);
  const house = useAppSelector(state => state.propHouse.onchainActiveHouse);
  const [loading, setLoading] = useState(false);
  const [errorFetchingRoundAndHouse, setErrorFetchingRoundAndHouse] = useState(false);

  useEffect(() => {
    if (round || house || errorFetchingRoundAndHouse) return;

    const fetchRoundOrHouse = async () => {
      setLoading(true);
      try {
        dispatch(setOnchainActiveHouse(await propHouse.query.getHouse(roundOrHouseAddress)));
        setLoading(false);
      } catch (e) {
        try {
          const roundWithHouse = await propHouse.query.getRoundWithHouseInfo(roundOrHouseAddress);
          dispatch(setOnchainActiveRound(roundWithHouse));
          dispatch(setOnchainActiveHouse(roundWithHouse.house));
          setLoading(false);
        } catch (e) {
          setLoading(false);
          setErrorFetchingRoundAndHouse(true);
        }
      }
    };
    fetchRoundOrHouse();
  });

  if (loading) return <LoadingIndicator />;
  if (!loading && errorFetchingRoundAndHouse) return <>Errror fetching round or house</>;

  return round ? <RoundPage /> : <House />;
};

export default RoundOrHouseRouter;
