import Avatar from '../Avatar';
import classes from './ProposalRankings.module.css';
import { Proposal } from '@prophouse/sdk-react';

const ProposalRankings: React.FC<{ proposals: Proposal[] }> = props => {
  const { proposals } = props;
  return (
    <div className={classes.container}>
      <div className={classes.rankingTitle}># Rankings</div>
      {proposals.map((p, index) => (
        <div key={index} className={classes.item}>
          <span className={classes.place}>{index + 1}.</span>{' '}
          <span className={classes.avatar}>
            <Avatar address={p.proposer} diameter={12} />
          </span>
          <span className={classes.title}>{p.title}</span>
          <div className={classes.votingPower}>{p.votingPower} votes</div>
        </div>
      ))}
    </div>
  );
};
export default ProposalRankings;
