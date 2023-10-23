import classes from './MainApp.module.css';
import { House, Proposal, RoundWithHouse, Vote, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import EthAddress from '../../components/EthAddress';
import { useNavigate } from 'react-router-dom';
import RoundCard from '../../components/RoundCard';
import { isMobile } from 'web3modal';

const MainApp = () => {
  const prophouse = usePropHouse();
  const navigate = useNavigate();

  const [rounds, setRounds] = useState<RoundWithHouse[]>();
  const [houses, setHouses] = useState<House[]>();
  const [activity, setActivity] = useState<(Proposal | Vote)[]>();
  const [fetchedProps, setFetchedProps] = useState(false);
  const [fetchedVotes, setFetchedVotes] = useState(false);

  useEffect(() => {
    if (rounds) return;
    const fetchRounds = async () => {
      try {
        setRounds(await prophouse.query.getRoundsWithHouseInfo());
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

  useEffect(() => {
    if (fetchedProps) return;
    const fetchProps = async () => {
      try {
        const props = await prophouse.query.getProposalsForRound(
          '0xab6e5c6ab3472175a5de62c7d79226d6238b7f37',
        );
        setActivity(prev => [...(prev ?? []), ...(props ?? [])]);
        setFetchedProps(true);
      } catch (e) {
        setFetchedProps(true);
        console.log(e);
      }
    };
    fetchProps();
  });

  useEffect(() => {
    if (fetchedVotes) return;
    const fetchVotes = async () => {
      try {
        const votes = await prophouse.query.getVotesByAccount(
          '0xb0dd496FffFa300df1EFf42702066aCa81834404',
          {
            where: { round_: { sourceChainRound: '0xab6e5c6ab3472175a5de62c7d79226d6238b7f37' } },
          },
        );
        setActivity(prev => [...(prev ?? []), ...(votes ?? [])]);
        setFetchedVotes(true);
      } catch (e) {
        setFetchedVotes(true);
        console.log(e);
      }
    };
    fetchVotes();
  });

  const housesFeed = (
    <Col xl={2}>
      <h5 style={{ marginBottom: '16px' }}>Communities</h5>
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
                }}
                onClick={() => {
                  navigate(`/${house.address}`);
                }}
              >
                <img
                  src={house.imageURI?.replace(/prophouse.mypinata.cloud/g, 'cloudflare-ipfs.com')}
                  alt="house profile"
                  style={{ height: 16, width: 16, borderRadius: 8, marginRight: 6 }}
                />
                {house.name}
              </div>
            );
          })}
      </div>
    </Col>
  );

  const roundsFeed = (
    <Col xl={5} className="mx-auto">
      <h5>Rounds</h5>
      <div className={classes.roundsContainer}>
        {rounds &&
          rounds.map((round, i) => {
            return (
              <Col xl={12} key={i}>
                <RoundCard round={round} house={round.house} />
              </Col>
            );
          })}
      </div>
    </Col>
  );

  const activityFeed = (
    <Col xl={4}>
      <h5 style={{ marginBottom: '16px' }}>Activity</h5>
      <div className={classes.activityContainer}>
        {activity &&
          activity.map((item, i) => {
            if ('proposer' in item) {
              return (
                <p className={classes.activityItem} key={i}>
                  <EthAddress
                    address={item.proposer}
                    addAvatar={true}
                    avatarSize={12}
                    className={classes.address}
                  />
                  &nbsp;proposed&nbsp;{item.title}
                </p>
              );
            }
            return (
              <p className={classes.activityItem} key={i}>
                <EthAddress
                  address={item.voter}
                  addAvatar={true}
                  avatarSize={12}
                  className={classes.address}
                />
                &nbsp;voted&nbsp;{item.votingPower}&nbsp;
              </p>
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
            <Tabs defaultActiveKey="rounds" className="mb-3">
              <Tab eventKey="houses" title="Houses">
                {housesFeed}
              </Tab>
              <Tab eventKey="rounds" title="Rounds">
                {roundsFeed}
              </Tab>
              <Tab eventKey="activity" title="Activity">
                {activityFeed}
              </Tab>
            </Tabs>
          </>
        ) : (
          <>
            {housesFeed}
            {roundsFeed}
            {activityFeed}
          </>
        )}
      </Row>
    </Container>
  );
};

export default MainApp;
