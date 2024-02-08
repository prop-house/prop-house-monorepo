import classes from './ActivityFeed.module.css';
import {
  OrderDirection,
  Proposal,
  Vote,
  usePropHouse,
  Vote_Order_By,
  Proposal_Order_By,
} from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';
import Skeleton from 'react-loading-skeleton';
import ActivityFeedItem from '../ActivityFeedItem';

type ActivityItem = Proposal | Vote;

const ActivityFeed: React.FC<{}> = () => {
  const propHouse = usePropHouse();

  const [activity, setActivity] = useState<ActivityItem[]>();
  const [fetchMoreActivity, setFetchMoreActivity] = useState(true);
  const [votesPageIndex, setVotesPageIndex] = useState(1);
  const [propsPageIndex, setPropsPageIndex] = useState(1);
  const [endOfVotes, setEndOfVotes] = useState(false);
  const [endOfProps, setEndOfProps] = useState(false);

  useEffect(() => {
    if (!fetchMoreActivity) return;

    const fetchVotes = async () => {
      try {
        setFetchMoreActivity(false);

        const votes = await propHouse.query.getVotes({
          page: votesPageIndex,
          orderBy: Vote_Order_By.ReceivedAt,
          orderDirection: OrderDirection.Desc,
        });

        votes.length === 0 ? setEndOfVotes(true) : setVotesPageIndex(prev => prev + 1);

        setActivity(prev => {
          const prevActivity = prev || [];
          return [...prevActivity, ...votes].sort((a, b) => (a.receivedAt > b.receivedAt ? -1 : 1));
        });
      } catch (e) {
        setFetchMoreActivity(false);
        console.log(e);
      }
    };
    fetchVotes();
  });

  useEffect(() => {
    if (!fetchMoreActivity) return;

    const fetchProps = async () => {
      try {
        setFetchMoreActivity(false);

        const props = await propHouse.query.getProposals({
          page: propsPageIndex,
          orderBy: Proposal_Order_By.ReceivedAt,
          orderDirection: OrderDirection.Desc,
        });

        props.length === 0 ? setEndOfProps(true) : setPropsPageIndex(prev => prev + 1);

        setActivity(prev => {
          const prevActivity = prev || [];
          return [...prevActivity, ...props].sort((a, b) => (a.receivedAt > b.receivedAt ? -1 : 1));
        });
      } catch (e) {
        setFetchMoreActivity(false);
        console.log(e);
      }
    };
    fetchProps();
  });

  return (
    <Row>
      <Col>
        <div className={classes.activityContainer}>
          {!activity
            ? Array(10)
                .fill(0)
                .map((_, i) => <Skeleton height={50} key={i} />)
            : activity.map((item, i) => {
                return <ActivityFeedItem item={item} key={i} />;
              })}
          <Button
            text={endOfProps && endOfVotes ? 'End of activity' : 'Load more'}
            onClick={() => setFetchMoreActivity(true)}
            bgColor={ButtonColor.Purple}
            disabled={endOfProps && endOfVotes}
          />
        </div>
      </Col>
    </Row>
  );
};
export default ActivityFeed;
