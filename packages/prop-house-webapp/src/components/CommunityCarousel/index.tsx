import CommunityCard from '../CommunityCard';
import CarouselSection from '../CarouselSection';
import { useEffect, useState, useRef } from 'react';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';

const CommunityCarousel = () => {
  const [communities, setCommunities] = useState<Community[]>([]);

  const { library } = useEthers();
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch communities
  useEffect(() => {
    const getCommunities = async () => {
      const communities = await client.current.getCommunities();
      setCommunities(communities);
    };
    getCommunities();
  }, []);

  const cards = communities.map((c) => <CommunityCard community={c} />);

  return (
    <CarouselSection
      contextTitle="Browse communities"
      mainTitle="Discover prop houses "
      linkDest="/explore"
      cards={cards}
    />
  );
};

export default CommunityCarousel;
