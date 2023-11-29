import classes from './MainApp.module.css';
import { House, RoundWithHouse, Timed, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Container, Dropdown, Row, Tab, Tabs } from 'react-bootstrap';
import { isMobile } from 'web3modal';
import ActivityFeed from '../../components/ActivityFeed';
import RoundsFeed from '../../components/RoundsFeed';
import CommunityCard from '../../components/CommunityCard';
import Button, { ButtonColor } from '../../components/Button';
import { useNavigate } from 'react-router-dom';

const MainApp = () => {
  const prophouse = usePropHouse();

  const [rounds, setRounds] = useState<RoundWithHouse[]>();
  const [houses, setHouses] = useState<House[]>();
  const navigate = useNavigate();

  useEffect(() => {
    if (rounds) return;
    const fetchRounds = async () => {
      try {
        const rounds = (
          await prophouse.query.getRoundsWithHouseInfo({ page: 1, perPage: 5 })
        ).filter(r => r.state !== Timed.RoundState.CANCELLED);
        setRounds(rounds);
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
                  <RoundsFeed />
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
              <div className={classes.roundsHeader}>
                <div className={classes.sectionTitle}>Rounds</div>
                <Dropdown drop="down" align="end">
                  <Dropdown.Toggle id="dropdown-basic" className={classes.dropdown}>
                    Show: All
                  </Dropdown.Toggle>

                  <Dropdown.Menu className={classes.dropdownMenu}>
                    <Dropdown.Item href="#/action-1">Favorite communities</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Proposed in</Dropdown.Item>
                    <Dropdown.Item href="#/action-3">Voted in</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
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
