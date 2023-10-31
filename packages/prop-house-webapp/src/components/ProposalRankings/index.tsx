import Avatar from '../Avatar';
import classes from './ProposalRankings.module.css';
import { Proposal } from '@prophouse/sdk-react';

const ProposalRankings: React.FC<{ proposals: Proposal[] }> = props => {
  const { proposals } = props;
  return (
    <div className={classes.container}>
      <div className={classes.title}># Rankings</div>
      {proposals.map((p, index) => (
        <div className={classes.item}>
          <div>
            <span className={classes.place}>{index + 1}.</span>{' '}
            <Avatar address={p.proposer} diameter={12} />{' '}
            <span className={classes.title}>{p.title}</span>
          </div>
          <div className={classes.votingPower}>{p.votingPower} votes</div>
        </div>
      ))}
    </div>
  );
};
export default ProposalRankings;
