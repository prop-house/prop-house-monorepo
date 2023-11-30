import classes from './MainApp.module.css';
import { House, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Container, Dropdown, Row, Tab, Tabs } from 'react-bootstrap';
import { isMobile } from 'web3modal';
import ActivityFeed from '../../components/ActivityFeed';
import RoundsFeed from '../../components/RoundsFeed';
import CommunityCard from '../../components/CommunityCard';
import Button, { ButtonColor } from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import { RoundsFilter, useRoundsFilter } from '../../hooks/useRoundsFilter';

const MainApp = () => {
  const prophouse = usePropHouse();
  const { roundsFilter, updateRoundsFilter } = useRoundsFilter();

  const [houses, setHouses] = useState<House[]>();
  const navigate = useNavigate();

  useEffect(() => {
    if (houses) return;
    const getHouses = async () => {
      try {
        setHouses(await prophouse.query.getHouses());
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
              <div className={classes.roundsHeader}>
                <div className={classes.sectionTitle}>Rounds</div>
                <Dropdown drop="down" align="end">
                  <Dropdown.Toggle id="dropdown-basic" className={classes.dropdown}>
                    Show: {roundsFilter}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className={classes.dropdownMenu}>
                    {[RoundsFilter.Relevant, RoundsFilter.Favorites].map(f => (
                      <Dropdown.Item onClick={() => updateRoundsFilter(f)}>{f}</Dropdown.Item>
                    ))}
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
