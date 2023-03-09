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

  const QUERY_LIMIT = 6;
  const [loadingRelComms, setLoadingRelComms] = useState(false);
  const [relevantCommunities, setRelevantCommunites] = useState<string[] | undefined>(undefined);
  const [rounds, setRounds] = useState<StoredAuction[]>();
  const [roundsSkip, setRoundsSkip] = useState(0);

  const host = useAppSelector(state => state.configuration.backendHost);
  const wrapper = new PropHouseWrapper(host);

  useEffect(() => {
    if (relevantCommunities !== undefined || !block) return;

    const getRelComms = async () => {
      setLoadingRelComms(true);
      try {
        setRelevantCommunites(
          account ? Object.keys(await getRelevantComms(account, provider, block)) : [],
        );
      } catch (e) {
        console.log(e);
        setRelevantCommunites([]);
      }
      setLoadingRelComms(false);
    };
    getRelComms();
  }, [block, relevantCommunities, account, provider]);

  useEffect(() => {
    if (rounds || loadingRelComms || relevantCommunities === undefined) return;
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
    if (relevantCommunities === undefined) return;

    const newRounds =
      relevantCommunities.length > 0
        ? await wrapper.getActiveAuctionsForCommunities(
            roundsSkip,
            QUERY_LIMIT,
            relevantCommunities,
          )
        : await wrapper.getActiveAuctions(roundsSkip, QUERY_LIMIT);

    if (newRounds.length === 0) return;
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
