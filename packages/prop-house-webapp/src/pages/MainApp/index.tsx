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

interface QueryOptions {
  page: number;
  perPage: number;
  where?: {
    id_not_in: string[];
  };
}

const MainApp = () => {
  const prophouse = usePropHouse();

  const [houses, setHouses] = useState<House[]>();
  const navigate = useNavigate();
  const favorites = getFavoriteCommunities();

  const showMakeAppHomePage = localStorage.getItem('makeAppHomePage');

  useEffect(() => {
    if (houses) return;
    const getHouses = async () => {
      try {
        // if mobile, fetch all
        if (isMobile()) {
          const houses = await prophouse.query.getHouses();
          setHouses(sortHousesForFavs(houses, favorites));
          return;
        }

        // other fetch a mix of favs + non favs
        const favHouses = await prophouse.query.getHouses({
          page: 1,
          perPage: 3,
          where: {
            id_in: favorites.map(f => f.toLowerCase()),
          },
        });
        if (favHouses.length >= 3) {
          setHouses(favHouses);
          return;
        }

        const queryOptions: QueryOptions = {
          page: 1,
          perPage: 3 - favHouses.length,
        };

        if (favorites.length > 0)
          queryOptions.where = {
            id_not_in: favorites.map(f => f.toLowerCase()),
          };

        const notFavHouses = await prophouse.query.getHouses(queryOptions);
        setHouses([...favHouses, ...notFavHouses]);
      } catch (e) {
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
              <div className={classes.sectionTitle}>
                Communities
                <Button
                  bgColor={ButtonColor.White}
                  text="View all"
                  onClick={() => navigate('/communities')}
                />
              </div>
              {houses &&
                houses
                  .slice(0, 3)
                  .map((house, index) => <CommunityCard key={index} house={house} />)}

              {showMakeAppHomePage === null && <MakeAppHomePageButton />}

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
