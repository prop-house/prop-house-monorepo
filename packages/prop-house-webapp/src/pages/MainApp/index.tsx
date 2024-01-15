import classes from './MainApp.module.css';
import { House, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { isMobile } from 'web3modal';
import ActivityFeed from '../../components/ActivityFeed';
import RoundsFeed from '../../components/RoundsFeed';
import CommunityCard from '../../components/CommunityCard';
import Button, { ButtonColor } from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { getFavoriteCommunities } from '../../hooks/useFavoriteCommunities';
import { sortHousesForFavs } from '../../utils/sortHousesForFavs';
import MakeAppHomePageButton from '../../components/MakeAppHomePageButton';
import { useFeaturedHouses } from '../../hooks/useFeaturedRounds copy';
import Skeleton from 'react-loading-skeleton';

const MainApp = () => {
  const prophouse = usePropHouse();

  const [houses, setHouses] = useState<House[]>();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const favorites = getFavoriteCommunities();
  const showMakeAppHomePage = localStorage.getItem('makeAppHomePage');
  const { featuredHouses } = useFeaturedHouses();

  useEffect(() => {
    if (houses || featuredHouses === undefined) return;
    const getHouses = async () => {
      try {
        setLoading(true);

        // if mobile, fetch all
        if (isMobile()) {
          const houses = await prophouse.query.getHouses();
          setHouses(sortHousesForFavs(houses, favorites));
          setLoading(false);
          return;
        }

        // other fetch a mix of favs + non favs
        const houses = await prophouse.query.getHouses({
          page: 1,
          perPage: 3,
          where: {
            id_in: [...featuredHouses],
          },
        });
        setHouses(houses.reverse());
        setLoading(false);
      } catch (e) {
        setLoading(false);
        console.log(e);
      }
    };
    getHouses();
  });

  return (
    <Container>
      <Row>
        {isMobile() ? (
          <Col>
            <Tabs defaultActiveKey="rounds" className={classes.tabs}>
              <Tab eventKey="rounds" title="Rounds">
                {isMobile() && showMakeAppHomePage === null && <MakeAppHomePageButton />}
                <RoundsFeed />
              </Tab>
              <Tab eventKey="activity" title="Activity">
                <ActivityFeed />
              </Tab>
              <Tab eventKey="communities" title="Communities">
                {houses &&
                  houses.map((house, index) => <CommunityCard key={index} house={house} />)}
              </Tab>
            </Tabs>
          </Col>
        ) : (
          <>
            <Col xl={9}>
              <RoundsFeed />
            </Col>
            <Col xl={3} className={classes.rightCol}>
              {showMakeAppHomePage === null && <MakeAppHomePageButton />}

              <div className={classes.sectionTitle}>
                Featured
                <Button
                  bgColor={ButtonColor.White}
                  text="View all"
                  onClick={() => navigate('/communities')}
                />
              </div>
              {loading
                ? Array.from(Array(3).keys()).map(i => (
                    <Skeleton height={52} style={{ margin: '12px 0' }} />
                  ))
                : houses &&
                  houses.map((house, index) => <CommunityCard key={index} house={house} />)}

              <div className={classes.sectionTitle}>Activity</div>
              <ActivityFeed />
            </Col>
          </>
        )}
      </Row>
    </Container>
  );
};

export default MainApp;
