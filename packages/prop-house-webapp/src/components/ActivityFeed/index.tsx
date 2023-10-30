import classes from './ActivityFeed.module.css';
import { Proposal, Vote, usePropHouse } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';
import EthAddress from '../EthAddress';

const ActivityFeed: React.FC<{}> = () => {
  const propHouse = usePropHouse();
  const [activity, setActivity] = useState<(Proposal | Vote)[]>();
  const [fetchedProps, setFetchedProps] = useState(false);
  const [fetchedVotes, setFetchedVotes] = useState(false);

  useEffect(() => {
    if (fetchedProps) return;
    const fetchProps = async () => {
      try {
        const props = await propHouse.query.getProposals();
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
        const votes = await propHouse.query.getVotes();
        setActivity(prev => [...(prev ?? []), ...(votes ?? [])]);
        setFetchedVotes(true);
      } catch (e) {
        setFetchedVotes(true);
        console.log(e);
      }
    };
    fetchVotes();
  });

  return (
    <Col>
      <div className={classes.activityContainer}>
        {activity &&
          activity.map((item, i) => {
            if ('proposer' in item) {
              return (
                <div className={classes.activityItem} key={i}>
                  <EthAddress
                    address={item.proposer}
                    addAvatar={true}
                    avatarSize={12}
                    className={classes.address}
                  />
                  &nbsp;proposed&nbsp;{item.title}
                </div>
              );
            }
            return (
              <div className={classes.activityItem} key={i}>
                <EthAddress
                  address={item.voter}
                  addAvatar={true}
                  avatarSize={12}
                  className={classes.address}
                />
                &nbsp;voted&nbsp;{item.votingPower}&nbsp;
              </div>
            );
          })}
      </div>
    </Col>
  );
};
export default ActivityFeed;
