import classes from './ActivityFeed.module.css';
import { Proposal, Vote, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import EthAddress from '../EthAddress';
import { shortFromNow } from '../../utils/shortenFromNow';
import { useNavigate } from 'react-router-dom';

const ActivityFeed: React.FC<{}> = () => {
  const propHouse = usePropHouse();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<(Proposal | Vote)[]>();
  const [fetchingProps, setFetchingProps] = useState(false);
  const [fetchingVotes, setFetchingVotes] = useState(false);
  const [fetchedProps, setFetchedProps] = useState(false);
  const [fetchedVotes, setFetchedVotes] = useState(false);

  useEffect(() => {
    if (fetchedProps || fetchingProps) return;
    const fetchProps = async () => {
      try {
        setFetchingProps(true);
        const props = await propHouse.query.getProposals({ page: 1, perPage: 10 });
        setActivity(prev => {
          const newData = [...(prev ?? []), ...(props ?? [])].sort((a, b) =>
            a.receivedAt < b.receivedAt ? 1 : -1,
          );
          return newData;
        });
        setFetchingProps(false);
        setFetchedProps(true);
      } catch (e) {
        setFetchingProps(false);
        setFetchedProps(true);
        console.log(e);
      }
    };
    fetchProps();
  });

  useEffect(() => {
    if (fetchedVotes || fetchingVotes) return;
    const fetchVotes = async () => {
      try {
        setFetchingVotes(true);
        const votes = await propHouse.query.getVotes({ page: 1, perPage: 10 });
        setFetchingVotes(false);
        setActivity(prev => {
          const newData = [...(prev ?? []), ...(votes ?? [])].sort((a, b) =>
            a.receivedAt < b.receivedAt ? 1 : -1,
          );
          return newData;
        });
        setFetchingVotes(false);
        setFetchedVotes(true);
      } catch (e) {
        setFetchingVotes(false);
        setFetchedVotes(true);
        console.log(e);
      }
    };
    fetchVotes();
  });

  const activityContent = (item: Proposal | Vote) => {
    return 'proposer' in item ? (
      <>
        proposed&nbsp;
        <span onClick={() => navigate(`/${item.round}/${item.id}`)}>{item.title}</span>
      </>
    ) : (
      <>
        casted&nbsp;
        {item.votingPower}
        &nbsp;vote{Number(item.votingPower) !== 1 && 's'}
      </>
    );
  };

  return (
    <Row>
      <Col>
        <div className={classes.activityContainer}>
          {activity &&
            activity.map((item, i) => {
              return (
                <div className={classes.activityItem} key={i}>
                  <div className={classes.timestamp}>{shortFromNow(item.receivedAt * 1000)}</div>
                  <div>
                    <EthAddress
                      address={'proposer' in item ? item.proposer : item.voter}
                      addAvatar={true}
                      avatarSize={12}
                      className={classes.address}
                    />
                    <div className={classes.activityContent}>{activityContent(item)}</div>
                  </div>
                </div>
              );
            })}
        </div>
      </Col>
    </Row>
  );
};
export default ActivityFeed;
