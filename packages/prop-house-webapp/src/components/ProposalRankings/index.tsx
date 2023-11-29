import { HiTrophy } from 'react-icons/hi2';
import Avatar from '../Avatar';
import classes from './ProposalRankings.module.css';
import { Proposal } from '@prophouse/sdk-react';
import { trophyColors } from '../../utils/trophyColors';

const ProposalRankings: React.FC<{ proposals: Proposal[]; areWinners?: boolean }> = props => {
  const { proposals, areWinners } = props;
  return (
    <div className={classes.container}>
      <div className={classes.rankingTitle}>
        <HiTrophy size={14} color={trophyColors('first')} />
        {`${areWinners ? 'Winners' : 'Rankings'}`}
      </div>
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
