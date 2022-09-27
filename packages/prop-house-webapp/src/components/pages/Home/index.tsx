import HomeHeader from '../../HomeHeader';
import { Container } from 'react-bootstrap';
import CommunityCardGrid from '../../CommunityCardGrid';
import { useEffect, useState, useRef } from 'react';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import { useAppSelector } from '../../../hooks';

export interface StatsProps {
  accEthFunded: number;
  accRounds: number;
  accProps: number;
}

const Home = () => {
  const [input, setInput] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StatsProps>({
    accEthFunded: 0,
    accRounds: 0,
    accProps: 0,
  });

  const handleSeachInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const { library } = useEthers();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch communities & proposals
  useEffect(() => {
    const getCommunitiesAndProposals = async () => {
      setIsLoading(true);
      const communities = await client.current.getCommunities();

      setCommunities(communities);
      const accEthFunded = communities.reduce((prev, current) => prev + current.ethFunded, 0);
      const accRounds = communities.reduce((prev, current) => prev + current.numAuctions, 0);
      const accProps = communities.reduce((prev, current) => prev + current.numProposals, 0);
      setStats({
        accEthFunded,
        accRounds,
        accProps,
      });

      setIsLoading(false);
    };
    getCommunitiesAndProposals();
  }, []);

  return (
    <>
      <HomeHeader input={input} handleSeachInputChange={handleSeachInputChange} stats={stats} />

      <Container>
        <CommunityCardGrid input={input} communities={communities} isLoading={isLoading} />
      </Container>
    </>
  );
};

export default Home;
