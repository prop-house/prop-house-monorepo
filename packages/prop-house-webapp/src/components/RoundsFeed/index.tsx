import classes from './RoundsFeed.module.css';
import { RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import JumboRoundCard from '../JumoboRoundCard';
import RoundCard from '../RoundCard';
import LoadingIndicator from '../LoadingIndicator';

const RoundsFeed = () => {
  const propHouse = usePropHouse();
  const [rounds, setRounds] = useState<RoundWithHouse[]>();
  const [fetchingRounds, setFetchingRounds] = useState(false);
  const [fetchNewRounds, setFetchNewRounds] = useState(true);

  const [pageIndex, setPageIndex] = useState(1);

  const isInitialPage = pageIndex === 1;

  useEffect(() => {
    if (!fetchNewRounds) return;
    const _fetchRounds = async () => {
      try {
        setFetchingRounds(true);
        setRounds(
          await propHouse.query.getRoundsWithHouseInfo({
            page: pageIndex,
            perPage: isInitialPage ? 5 : 6,
          }),
        );
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

  return fetchingRounds ? (
    <LoadingIndicator />
  ) : (
    <>
      <Row>
        {isInitialPage && rounds && <JumboRoundCard round={rounds[0]} house={rounds[0].house} />}
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
      <Row>
        <Col className={classes.pagesCol}>
          {!isInitialPage && (
            <div
              className={classes.pageButton}
              onClick={() => {
                setFetchNewRounds(true);
                setPageIndex(prev => prev - 1);
              }}
            >
              Back
            </div>
          )}
          <div
            className={classes.pageButton}
            onClick={() => {
              setFetchNewRounds(true);
              setPageIndex(prev => prev + 1);
            }}
          >
            Next page
          </div>
        </Col>
      </Row>
    </>
  );
};
export default RoundsFeed;
