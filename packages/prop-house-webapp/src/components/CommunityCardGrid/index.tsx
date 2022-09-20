import CommunityCard from '../CommunityCard';
import classes from './CommunityCardGrid.module.css';
import { useEffect, useState } from 'react';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';

import RoundMessage from '../RoundMessage';
import LoadingIndicator from '../LoadingIndicator';

interface CommunityCardGridProps {
  input: string;
  communities: Community[];
  isLoading: boolean;
}

const CommunityCardGrid = ({ input, communities, isLoading }: CommunityCardGridProps) => {
  const [filteredHouses, setFilteredHouses] = useState<Community[]>([]);

  useEffect(() => {
    if (!communities || communities.length === 0) return;
    if (input.length === 0) setFilteredHouses(communities);

    setFilteredHouses(
      communities.filter(c => {
        const query = input.toLowerCase();

        return (
          c.name.toLowerCase().indexOf(query) >= 0 ||
          c.description?.toString().toLowerCase().indexOf(query) >= 0
        );
      }),
    );
  }, [communities, input]);

  const cards = filteredHouses.map((c, i) => <CommunityCard community={c} key={i} />);

  return (
    <>
      {!isLoading ? (
        filteredHouses && filteredHouses.length > 0 ? (
          <div className={classes.cardGrid}>{cards}</div>
        ) : (
          <RoundMessage message="No houses found" />
        )
      ) : (
        <LoadingIndicator />
      )}
    </>
  );
};

export default CommunityCardGrid;
