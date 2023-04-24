import HomeHeader from '../../components/HomeHeader';
import classes from './Home.module.css';
import { Container } from 'react-bootstrap';
import CommunityCardGrid from '../../components/CommunityCardGrid';
import { useEffect, useState, useRef } from 'react';
import { usePropHouse, House, House_OrderBy, OrderDirection, GlobalStats } from '@prophouse/sdk-react';
// import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAppSelector } from '../../hooks';
import NavBar from '../../components/NavBar';
import { useSigner } from 'wagmi';

const Home = () => {
  const [input, setInput] = useState('');
  const [houses, setHouses] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<GlobalStats>({
    roundCount: 0,
    proposalCount: 0,
    uniqueProposers: 0,
    uniqueVoters: 0,
  });

  const handleSeachInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const propHouse = usePropHouse();
  const { data: signer } = useSigner();

  const host = useAppSelector(state => state.configuration.backendHost);

  // fetch communities
  useEffect(() => {
    const getCommunities = async () => {
      setIsLoading(true);

      const [houses, summary] = await Promise.all([
        propHouse.query.getHouses({
          orderBy: House_OrderBy.RoundCount,
          orderDirection: OrderDirection.Desc,
        }),
        propHouse.query.getGlobalStats(),
      ]);

      setHouses(houses);
      setStats(summary);
      setIsLoading(false);
    };
    getCommunities();
  }, [propHouse.query]);

  return (
    <>
      <div className="homeGradientBg">
        <NavBar />
        <HomeHeader input={input} handleSeachInputChange={handleSeachInputChange} stats={stats} />
      </div>

      <Container className={classes.homeCardsContainer}>
        <CommunityCardGrid input={input} houses={houses} isLoading={isLoading} />
      </Container>
    </>
  );
};

export default Home;
