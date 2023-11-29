import classes from './RoundsFeed.module.css';
import { RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import JumboRoundCard from '../JumboRoundCard';
import LoadingIndicator from '../LoadingIndicator';
import Button, { ButtonColor } from '../Button';

const RoundsFeed = () => {
  const propHouse = usePropHouse();
  const [rounds, setRounds] = useState<RoundWithHouse[]>();
  const [fetchingRounds, setFetchingRounds] = useState(true);
  const [fetchNewRounds, setFetchNewRounds] = useState(true);
  const [noMoreRounds, setNoMoreRounds] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);

  useEffect(() => {
    if (!fetchNewRounds) return;

    const _fetchRounds = async () => {
      try {
        setFetchingRounds(true);
        setFetchNewRounds(false);
        const fetchedRounds = await propHouse.query.getRoundsWithHouseInfo({
          page: pageIndex,
          perPage: 6,
        });
        setFetchingRounds(false);

        if (fetchedRounds.length === 0) {
          setNoMoreRounds(false);
          return;
        }

        setPageIndex(prev => prev + 1);
        setRounds(prev => {
          if (prev) return [...prev, ...fetchedRounds];
          return fetchedRounds;
        });
      } catch (e) {
        console.log(e);
        setFetchNewRounds(false);
        setFetchingRounds(false);
      }
    };
    _fetchRounds();
  }, [pageIndex, fetchingRounds, fetchNewRounds, propHouse.query, rounds]);

  return (
    <>
      {fetchingRounds && !rounds ? (
        <LoadingIndicator />
      ) : (
        <>
          <Row>
            {rounds &&
              rounds.map((round, i) => {
                return (
                  <Col xl={12} key={i}>
                    <JumboRoundCard round={round} house={round.house} />
                  </Col>
                );
              })}
          </Row>
          <Row>
            <Col>
              <Button
                bgColor={ButtonColor.PurpleLight}
                text={
                  noMoreRounds
                    ? 'No more rounds available'
                    : fetchingRounds
                    ? 'Loading...'
                    : 'Load more rounds'
                }
                classNames={classes.loadMoreBtn}
                onClick={() => setFetchNewRounds(true)}
                disabled={noMoreRounds || fetchingRounds}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
};
export default RoundsFeed;
