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
  const [loadingRounds, setLoadingRounds] = useState(false);

  const [pageIndex, setPageIndex] = useState(1);

  const isInitialPage = pageIndex === 1;

  useEffect(() => {
    if (rounds && !loadingRounds) return;
    const fetchRounds = async () => {
      try {
        setLoadingRounds(true);
        setRounds(
          await propHouse.query.getRoundsWithHouseInfo({
            page: pageIndex,
            perPage: isInitialPage ? 5 : 6,
          }),
        );
        setLoadingRounds(false);
      } catch (e) {
        console.log(e);
        setLoadingRounds(false);
      }
    };
    fetchRounds();
  }, [pageIndex]);

  return loadingRounds ? (
    <LoadingIndicator />
  ) : (
    <>
      <Row>
        {isInitialPage && rounds && rounds[0] && (
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
      <Row>
        <Col className={classes.pagesCol}>
          {!isInitialPage && (
            <div
              className={classes.pageButton}
              onClick={() => {
                setLoadingRounds(true);
                setPageIndex(prev => prev - 1);
              }}
            >
              Back
            </div>
          )}
          <div
            className={classes.pageButton}
            onClick={() => {
              setLoadingRounds(true);
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
