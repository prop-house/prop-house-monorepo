import classes from './ActivityFeedItem.module.css';
import { Proposal, Vote } from '@prophouse/sdk-react';
import EthAddress from '../EthAddress';
import { timeFromNow } from '../../utils/timeFromNow';
import PropActivityItem from '../PropActivityItem';
import VoteActivityItem from '../VoteActivityItem';

const ActivityFeedItem: React.FC<{ item: Proposal | Vote }> = ({ item }) => {
  return (
    <div className={classes.activityItem} style={{ cursor: 'proposer' in item ? 'pointer' : '' }}>
      <div className={classes.header}>
        <EthAddress
          address={'proposer' in item ? item.proposer : item.voter}
          addAvatar={true}
          avatarSize={12}
          className={classes.address}
        />
        <div className={classes.timestamp}>{timeFromNow(item.receivedAt * 1000)}</div>
      </div>
      <div className={classes.activityContent}>
        {'proposer' in item ? (
          <PropActivityItem proposal={item} />
        ) : (
          <VoteActivityItem vote={item} />
        )}
      </div>
    </div>
  );
};

export default ActivityFeedItem;
