import classes from './CommunityCardGrid.module.css';
import { useEffect, useState } from 'react';
import ErrorMessageCard from '../ErrorMessageCard';
import LoadingIndicator from '../LoadingIndicator';
import { useTranslation } from 'react-i18next';
import HouseCard from '../CommunityCard';
import { House } from '@prophouse/sdk-react';

interface HouseCardGridProps {
  input: string;
  houses: House[];
  isLoading: boolean;
}

const HouseCardGrid = ({ input, houses, isLoading }: HouseCardGridProps) => {
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!houses || houses.length === 0) return;
    if (input.length === 0) setFilteredHouses(houses);

    setFilteredHouses(
      houses.filter(h => {
        const query = input.toLowerCase();

        return (
          h.name!.toLowerCase().indexOf(query) >= 0 ||
          h.description!.toString().toLowerCase().indexOf(query) >= 0
        );
      }),
    );
  }, [houses, input]);

  const cards = filteredHouses.map((house, i) => <HouseCard house={house} key={i} />);

  return (
    <>
      {!isLoading ? (
        filteredHouses && filteredHouses.length > 0 ? (
          <div className={classes.cardGrid}>{cards}</div>
        ) : (
          <ErrorMessageCard message={t('noHousesFound')} />
        )
      ) : (
        <LoadingIndicator />
      )}
    </>
  );
};

export default HouseCardGrid;
