import { HiTrophy } from 'react-icons/hi2';
import Avatar from '../Avatar';
import classes from './ProposalRankings.module.css';
import { Proposal, Round } from '@prophouse/sdk-react';
import { trophyColors } from '../../utils/trophyColors';
import { parsedVotingPower } from '../../utils/parsedVotingPower';

const ProposalRankings: React.FC<{
  proposals: Proposal[];
  round: Round;
  areWinners?: boolean;
}> = props => {
  const { proposals, round, areWinners } = props;

  return (
    <div className={classes.container}>
      <div className={classes.rankingTitle}>
        <HiTrophy size={14} color={trophyColors('first')} />
        {`${areWinners ? 'Winners' : 'Rankings'}`}
      </div>
      {proposals.length === 0 && <div className={classes.noProps}>No proposals were voted on.</div>}
      {proposals.map((p, index) => (
        <div key={index} className={classes.item}>
          <span className={classes.place}>{index + 1}.</span>{' '}
          <span className={classes.avatar}>
            <Avatar address={p.proposer} diameter={12} />
          </span>
          <span className={classes.title}>{p.title}</span>
          <div className={classes.votingPower}>
            {parsedVotingPower(p.votingPower, round.address)} votes
          </div>
        </div>
      ))}
    </div>
  );
};
export default ProposalRankings;
