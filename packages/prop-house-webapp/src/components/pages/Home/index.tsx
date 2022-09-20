import HomeHeader from '../../HomeHeader';
import { Container } from 'react-bootstrap';
import CommunityCardGrid from '../../CommunityCardGrid';
import { useEffect, useState, useRef } from 'react';
import { Community, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import { useAppSelector } from '../../../hooks';

export interface StatsProps {
  funded: number;
  votes: number;
  props: number;
}

const Home = () => {
  const [input, setInput] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StatsProps>({
    funded: 0,
    votes: 0,
    props: 0,
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
      const proposals = await client.current.getAllProposals();
      setCommunities(communities);

      communities &&
        proposals &&
        setStats({
          funded: communities
            .map((community: Community) => community.ethFunded)
            .flat()
            .reduce((a: number, b: number) => a + b, 0),
          votes: proposals
            .map((proposal: StoredProposalWithVotes) => proposal.votes)
            .flat()
            .reduce((a: number, b: number) => a + b, 0),
          props: proposals.length,
        });

      communities && proposals && setIsLoading(false);
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
