import CommunityCard from '../CommunityCard';
import classes from './CommunityCardGrid.module.css';
import { useEffect, useState } from 'react';
import { House } from '@prophouse/sdk-react';
import ErrorMessageCard from '../ErrorMessageCard';
import LoadingIndicator from '../LoadingIndicator';
import { useTranslation } from 'react-i18next';

interface CommunityCardGridProps {
  input: string;
  houses: House[];
  isLoading: boolean;
}

// TODO: Rename
const CommunityCardGrid = ({ input, houses, isLoading }: CommunityCardGridProps) => {
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!houses || houses.length === 0) return;
    if (input.length === 0) setFilteredHouses(houses);

    setFilteredHouses(
      houses.filter(c => {
        const query = input.toLowerCase();

        return (
          c.name && c.name.toLowerCase().indexOf(query) >= 0) ||(
          c.description && c.description.toString().toLowerCase().indexOf(query) >= 0
        );
      }),
    );
  }, [houses, input]);

  const cards = filteredHouses.map((c, i) => <CommunityCard house={c} key={i} />);

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

export default CommunityCardGrid;
