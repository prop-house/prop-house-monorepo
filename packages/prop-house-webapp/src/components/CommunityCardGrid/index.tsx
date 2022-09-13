import CommunityCard from '../CommunityCard';
import classes from './CommunityCardGrid.module.css';
import { useEffect, useState, useRef } from 'react';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import RoundMessage from '../RoundMessage';
import LoadingIndicator from '../LoadingIndicator';

interface CommunityCardGridProps {
  input: string;
}

const CommunityCardGrid = ({ input }: CommunityCardGridProps) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredHouses, setFilteredHouses] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { library } = useEthers();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch communities
  useEffect(() => {
    const getCommunities = async () => {
      setIsLoading(true);
      const communities = await client.current.getCommunities();
      setCommunities(communities);
      communities && setIsLoading(false);
    };
    getCommunities();
  }, []);

  useEffect(() => {
    communities &&
      communities.length > 0 &&
      (input.length === 0
        ? setFilteredHouses(communities)
        : setFilteredHouses(
            communities.filter(c => {
              const query = input.toLowerCase();

              return (
                c.name.toLowerCase().indexOf(query) >= 0 ||
                c.description?.toString().toLowerCase().indexOf(query) >= 0
              );
            }),
          ));
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
