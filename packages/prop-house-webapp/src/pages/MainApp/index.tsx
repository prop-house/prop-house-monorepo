import classes from './MainApp.module.css';
import { House, RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import RoundCard from '../../components/RoundCard';
import { isMobile } from 'web3modal';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import { jsNumberForAddress } from 'react-jazzicon';
import ActivityFeed from '../../components/ActivityFeed';
import RoundsFeed from '../../components/RoundsFeed';
import JumboRoundCard from '../../components/JumoboRoundCard';

const MainApp = () => {
  const prophouse = usePropHouse();
  const navigate = useNavigate();

  const [rounds, setRounds] = useState<RoundWithHouse[]>();
  const [houses, setHouses] = useState<House[]>();

  useEffect(() => {
    if (rounds) return;
    const fetchRounds = async () => {
      try {
        setRounds(await prophouse.query.getRoundsWithHouseInfo({ page: 1, perPage: 5 }));
      } catch (e) {
        console.log(e);
      }
    };
    fetchRounds();
  });

  useEffect(() => {
    if (rounds) return;
    const fetchHouses = async () => {
      try {
        setHouses(await prophouse.query.getHouses());
      } catch (e) {
        console.log(e);
      }
    };
    fetchHouses();
  });

  const housesFeed = (
    <Col>
      <div className={classes.housesContainer}>
        {houses &&
          houses.map((house, i) => {
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  color: 'var(--brand-gray)',
                  cursor: 'pointer',
                  rowGap: '8px',
                }}
                onClick={() => {
                  navigate(`/${house.address}`);
                }}
              >
                {house.imageURI?.includes('prop.house') ? (
                  <img
                    src={house.imageURI?.replace(
                      /prophouse.mypinata.cloud/g,
                      'cloudflare-ipfs.com',
                    )}
                    alt="house profile"
                    style={{ height: 16, width: 16, borderRadius: 8, marginRight: 6 }}
                  />
                ) : (
                  <span style={{ marginRight: 6 }}>
                    <Jazzicon diameter={16} seed={jsNumberForAddress(house.address)} />
                  </span>
                )}

                {house.name}
              </div>
            );
          })}
      </div>
    </Col>
  );

  return (
    <Container>
      <Row>
        {isMobile() ? (
          <>
            {rounds && <JumboRoundCard round={rounds[0]} house={rounds[0].house} />}
            <Tabs defaultActiveKey="rounds" className={classes.tabs}>
              <Tab eventKey="houses" title="Houses">
                {housesFeed}
              </Tab>
              <Tab eventKey="rounds" title="Rounds">
                <Row>
                  {rounds &&
                    rounds.map((round, i) => {
                      return (
                        <Col xl={6} key={i}>
                          <RoundCard house={round.house} round={round} displayBottomBar={true} />
                        </Col>
                      );
                    })}
                </Row>
              </Tab>
              <Tab eventKey="activity" title="Activity">
                <ActivityFeed />
              </Tab>
            </Tabs>
          </>
        ) : (
          <>
            <Col xl={9}>
              <RoundsFeed />
            </Col>
            <Col xl={3}>
              <ActivityFeed />
            </Col>
          </>
        )}
      </Row>
    </Container>
  );
};

export default MainApp;
