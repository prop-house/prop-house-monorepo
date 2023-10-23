import { usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HousePage from '../../pages/HousePage';
import RoundPage from '../../pages/RoundPage';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setOnchainActiveHouse, setOnchainActiveRound } from '../../state/slices/propHouse';
import LoadingIndicator from '../LoadingIndicator';

const RoundOrHouseRouter: React.FC<{}> = () => {
  const { roundOrHouse: roundOrHouseAddress } = useParams();

  const propHouse = usePropHouse();
  const dispatch = useAppDispatch();

  const round = useAppSelector(state => state.propHouse.onchainActiveRound);
  const house = useAppSelector(state => state.propHouse.onchainActiveHouse);

  const [loading, setLoading] = useState(false);
  const [isRoundOrHouse, setIsRoundOrHouse] = useState<'round' | 'house'>();
  const [errorFetchingRoundAndHouse, setErrorFetchingRoundAndHouse] = useState(false);
  const [lastAddressFetched, setLastAddressFetched] = useState<string>();

  useEffect(() => {
    if (lastAddressFetched === roundOrHouseAddress || !roundOrHouseAddress || loading) return;

    const fetchRoundOrHouse = async () => {
      setLoading(true);
      try {
        dispatch(setOnchainActiveHouse(await propHouse.query.getHouse(roundOrHouseAddress)));
        setIsRoundOrHouse('house');
        setLastAddressFetched(roundOrHouseAddress);
        setLoading(false);
      } catch (e) {
        try {
          const roundWithHouse = await propHouse.query.getRoundWithHouseInfo(roundOrHouseAddress);
          dispatch(setOnchainActiveRound(roundWithHouse));
          dispatch(setOnchainActiveHouse(roundWithHouse.house));
          setIsRoundOrHouse('round');
          setLastAddressFetched(roundOrHouseAddress);
          setLoading(false);
        } catch (e) {
          setErrorFetchingRoundAndHouse(true);
          setLoading(false);
        }
      }
    };
    fetchRoundOrHouse();
  }, [round, house, roundOrHouseAddress, dispatch, lastAddressFetched, loading, propHouse.query]);

  if (errorFetchingRoundAndHouse) return <>Error fetching round or house</>;
  if (loading) return <LoadingIndicator />;

  if (isRoundOrHouse === 'house' && house) return <HousePage />;
  if (isRoundOrHouse === 'round' && round && house) return <RoundPage />;

  return <>Error</>;
};

export default RoundOrHouseRouter;
