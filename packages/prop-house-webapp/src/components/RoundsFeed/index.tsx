import classes from './RoundsFeed.module.css';
import { RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import JumboRoundCard from '../JumoboRoundCard';
import RoundCard from '../RoundCard';
import LoadingIndicator from '../LoadingIndicator';
import { NounImage } from '../../utils/getNounImage';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const RoundsFeed = () => {
  const propHouse = usePropHouse();
  const [rounds, setRounds] = useState<RoundWithHouse[]>();
  const [fetchingRounds, setFetchingRounds] = useState(false);
  const [fetchNewRounds, setFetchNewRounds] = useState(true);
  const [noMoreRounds, setNoMoreRounds] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const isInitialPage = pageIndex === 1;

  useEffect(() => {
    if (!fetchNewRounds) return;
    const _fetchRounds = async () => {
      try {
        setFetchingRounds(true);
        const rounds = await propHouse.query.getRoundsWithHouseInfo({
          page: pageIndex,
          perPage: isInitialPage ? 5 : 6,
        });
        setNoMoreRounds(rounds.length === 0);
        setRounds(rounds);
        setFetchingRounds(false);
        setFetchNewRounds(false);
      } catch (e) {
        console.log(e);
        setFetchNewRounds(false);
        setFetchingRounds(false);
      }
    };
    _fetchRounds();
  }, [pageIndex, isInitialPage, fetchingRounds, fetchNewRounds, propHouse.query, rounds]);

  return (
    <>
      <Row className={classes.titleAndNavBar}>
        <Col className={classes.title}>Rounds</Col>
        <Col className={classes.pagesCol}>
          <button
            className={classes.pageButton}
            disabled={isInitialPage || fetchingRounds}
            onClick={() => {
              setFetchNewRounds(true);
              setPageIndex(prev => prev - 1);
            }}
          >
            <FaArrowLeft />
          </button>

          <button
            className={classes.pageButton}
            disabled={noMoreRounds || fetchingRounds}
            onClick={() => {
              setFetchNewRounds(true);
              setPageIndex(prev => prev + 1);
            }}
          >
            <FaArrowRight />
          </button>
        </Col>
      </Row>
      {fetchingRounds ? (
        <LoadingIndicator />
      ) : (
        <>
          {noMoreRounds && (
            <Row>
              <div className={classes.noMoreRoundsContainer}>
                <img src={NounImage.Blackhole.src} alt={NounImage.Blackhole.alt} />
                <p>You've reached the end of the rainbow</p>
              </div>
            </Row>
          )}
          <Row>
            {isInitialPage && rounds && (
              <JumboRoundCard round={rounds[0]} house={rounds[0].house} />
            )}
          </Row>
          <Row>
            {rounds &&
              rounds.slice(0, isInitialPage ? 4 : 6).map((round, i) => {
                return (
                  <Col xl={6} key={i}>
                    <RoundCard house={round.house} round={round} displayBottomBar={false} />
                  </Col>
                );
              })}
          </Row>
        </>
      )}
    </>
  );
};
export default RoundsFeed;
