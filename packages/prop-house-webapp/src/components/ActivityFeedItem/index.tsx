import classes from './ActivityFeedItem.module.css';
import { Proposal, Vote } from '@prophouse/sdk-react';
import EthAddress from '../EthAddress';
import { timeFromNow } from '../../utils/timeFromNow';
import { parsedVotingPower } from '../../utils/parsedVotingPower';
import PropActivityItem from '../PropActivityItem';
import { truncateThousands } from '../../utils/truncateThousands';

const ActivityFeedItem: React.FC<{ item: Proposal | Vote }> = ({ item }) => {
  const activityContent = (item: Proposal | Vote) => {
    let votes = parsedVotingPower(item.votingPower, item.round);

    return 'proposer' in item ? (
      <PropActivityItem proposal={item} />
    ) : (
      <>
        cast&nbsp;
        {votes.gte(1000) ? truncateThousands(votes.toNumber()) : votes.toString()}
        &nbsp;vote{votes.eq(1) ? '' : 's'}
      </>
    );
  };

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
      <div className={classes.activityContent}>{activityContent(item)}</div>
    </div>
  );
};

export default ActivityFeedItem;
