import classes from './StatusRoundCards.module.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { getRelevantComms } from 'prop-house-communities';
import { useEffect, useState } from 'react';
import { Col, Container, Navbar, Row } from 'react-bootstrap';
import { useAccount, useBlockNumber, useProvider } from 'wagmi';
import { useAppSelector } from '../../hooks';
import SimpleRoundCard from '../StatusRoundCard';
import { BiBadgeCheck } from 'react-icons/bi';
import LoadingIndicator from '../LoadingIndicator';

const StatusRoundCards = () => {
  const { address: account } = useAccount();
  const { data: block } = useBlockNumber();
  const provider = useProvider();

  const QUERY_LIMIT = 8;
  const [fetchingRelComms, setFetchingRelComms] = useState(false);
  const [fetchingMoreRounds, setFetchingMoreRounds] = useState(false);
  const [relevantCommunities, setRelevantCommunites] = useState<string[] | undefined>(undefined);
  const [rounds, setRounds] = useState<StoredAuction[]>();
  const [roundsSkip, setRoundsSkip] = useState(0);

  const host = useAppSelector(state => state.configuration.backendHost);
  const wrapper = new PropHouseWrapper(host);

  useEffect(() => {
    if (relevantCommunities !== undefined || !block) return;

    const getRelComms = async () => {
      setFetchingRelComms(true);
      try {
        setRelevantCommunites(
          account ? Object.keys(await getRelevantComms(account, provider, block)) : [],
        );
      } catch (e) {
        console.log('Error fetching relevant comms: ', e);
        setRelevantCommunites([]);
      }
      setFetchingRelComms(false);
    };
    getRelComms();
  }, [block, relevantCommunities, account, provider]);

  useEffect(() => {
    if (rounds || fetchingRelComms || relevantCommunities === undefined) return;
    const getRounds = async () => {
      try {
        relevantCommunities.length > 0
          ? setRounds(
              await wrapper.getActiveAuctionsForCommunities(
                roundsSkip,
                QUERY_LIMIT,
                relevantCommunities,
              ),
            )
          : setRounds(await wrapper.getActiveAuctions(roundsSkip, QUERY_LIMIT));
        setRoundsSkip(QUERY_LIMIT);
      } catch (e) {
        console.log(e);
      }
    };
    getRounds();
  });

  const fetchMoreRounds = async () => {
    setFetchingMoreRounds(true);

    let newRounds: StoredAuction[];
    if (relevantCommunities && relevantCommunities.length > 0) {
      newRounds = await wrapper.getActiveAuctionsForCommunities(
        roundsSkip,
        QUERY_LIMIT,
        relevantCommunities,
      );
    } else {
      newRounds = await wrapper.getActiveAuctions(roundsSkip, QUERY_LIMIT);
    }
    setFetchingMoreRounds(false);
    if (newRounds.length === 0) return;

    setRounds(prev => {
      return !prev ? [...newRounds] : [...prev, ...newRounds];
    });
    setRoundsSkip(prev => prev + QUERY_LIMIT);
  };

  const handleScroll = () => {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    console.log('scrollTop: ', scrollTop);
    console.log('clientHeight: ', clientHeight);
    console.log('scrollHeight: ', scrollHeight);
    if (scrollTop + clientHeight >= scrollHeight && !fetchingMoreRounds) fetchMoreRounds();
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line
  }, [fetchingMoreRounds]);

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
        {fetchingRelComms ? (
          <LoadingIndicator />
        ) : (
          <>
            <Row>
              {rounds && (
                <>
                  {rounds.map(r => (
                    <Col md={6}>
                      <SimpleRoundCard round={r} />
                    </Col>
                  ))}
                </>
              )}
            </Row>
          </>
        )}
        {<Row>{fetchingMoreRounds && <LoadingIndicator />}</Row>}
      </Container>
    </>
  );
};

export default StatusRoundCards;
