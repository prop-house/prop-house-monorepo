import classes from './Base.module.css';
import './Base.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { getRelevantComms } from 'prop-house-communities';
import { useEffect, useState } from 'react';
import { Col, Container, Navbar, Row } from 'react-bootstrap';
import { useAccount, useBlockNumber, useProvider } from 'wagmi';
import { useAppSelector } from '../../hooks';
import SimpleRoundCard from '../../components/SimpleRoundCard';
import { BiBadgeCheck } from 'react-icons/bi';
import Button, { ButtonColor } from '../../components/Button';

const Base = () => {
  const { address: account } = useAccount();
  const { data: block } = useBlockNumber();
  const provider = useProvider();

  const QUERY_LIMIT = 3;
  const [loadingRelComms, setLoadingRelComms] = useState(false);
  const [relevantCommunities, setRelevantCommunites] = useState<string[] | undefined>(undefined);
  const [rounds, setRounds] = useState<StoredAuction[]>();
  const [roundsSkip, setRoundsSkip] = useState(0);

  const host = useAppSelector(state => state.configuration.backendHost);
  const wrapper = new PropHouseWrapper(host);

  useEffect(() => {
    if (!account || relevantCommunities !== undefined || block === undefined) return;
    const getRelComms = async () => {
      try {
        setRelevantCommunites(Object.keys(await getRelevantComms(account, provider, block)));
        setLoadingRelComms(true);
      } catch (e) {
        setRelevantCommunites([]);
        setLoadingRelComms(true);
      }
    };
    getRelComms();
  });

  useEffect(() => {
    if (!account || rounds || !loadingRelComms) return;
    const getRounds = async () => {
      try {
        if (relevantCommunities && relevantCommunities.length > 0) {
          setRounds(
            await wrapper.getActiveAuctionsForCommunities(
              roundsSkip,
              QUERY_LIMIT,
              relevantCommunities,
            ),
          );
          setRoundsSkip(QUERY_LIMIT + 1);
        } else {
          setRounds(await wrapper.getActiveAuctions());
        }
      } catch (e) {
        console.log(e);
      }
    };
    getRounds();
  });

  const fetchMoreRounds = async () => {
    if (relevantCommunities === undefined) return;
    console.log(roundsSkip);
    const newRounds = await wrapper.getActiveAuctionsForCommunities(
      roundsSkip,
      QUERY_LIMIT,
      relevantCommunities,
    );
    console.log(newRounds);
    setRounds(prev => {
      return !prev ? [...newRounds] : [...prev, ...newRounds];
    });
    setRoundsSkip(prev => prev + QUERY_LIMIT);
  };

  return (
    <>
      <Container>
        <Navbar />
      </Container>
      <Container>
        <Row>
          <Col>
            <div className={classes.sectionTitle}>
              <BiBadgeCheck className={classes.icon} size={22} />
              <>Active rounds</>
            </div>
          </Col>
        </Row>
        <Row>
          {rounds && (
            <>
              {rounds.map(r => (
                <Col md={6}>
                  <SimpleRoundCard round={r} />
                </Col>
              ))}
              <Row>
                <Col>
                  <Button
                    text="Load more rounds..."
                    bgColor={ButtonColor.Green}
                    onClick={() => fetchMoreRounds()}
                    classNames={classes.loadMoreRoundsBtn}
                  />
                </Col>
              </Row>
            </>
          )}
        </Row>
      </Container>
    </>
  );
};

export default Base;
