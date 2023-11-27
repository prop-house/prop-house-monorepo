import classes from './MainApp.module.css';
import { House, RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { isMobile } from 'web3modal';
import ActivityFeed from '../../components/ActivityFeed';
import RoundsFeed from '../../components/RoundsFeed';
import JumboRoundCard from '../../components/JumboRoundCard';
import CommunityCard from '../../components/CommunityCard';

const MainApp = () => {
  const prophouse = usePropHouse();

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

  return (
    <Container>
      <Row>
        {isMobile() ? (
          <Col>
            <Tabs defaultActiveKey="rounds" className={classes.tabs}>
              <Tab eventKey="rounds" title="Rounds">
                <Row>
                  {rounds && (
                    <>
                      {rounds.map((round, i) => {
                        return (
                          <Col xl={6} key={i}>
                            <JumboRoundCard round={round} house={round.house} />
                          </Col>
                        );
                      })}
                    </>
                  )}
                </Row>
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
            <Col xl={3}>
              <div className={classes.sectionTitle}>Communities</div>
              {houses &&
                houses
                  .slice(0, 3)
                  .map((house, index) => <CommunityCard key={index} house={house} />)}

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
