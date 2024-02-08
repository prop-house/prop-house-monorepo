import { Vote } from '@prophouse/sdk-react';
import { useNavigate } from 'react-router-dom';
import { parsedVotingPower } from '../../utils/parsedVotingPower';
import { truncateThousands } from '../../utils/truncateThousands';

const VoteActivityItem: React.FC<{ vote: Vote }> = ({ vote }) => {
  const navigate = useNavigate();
  let votes = parsedVotingPower(vote.votingPower, vote.round);

  return (
    <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/${vote.round}`)}>
      {`cast `}
      <b>{` ${votes.gte(1000) ? truncateThousands(votes.toNumber()) : votes.toString()} vote${
        votes.eq(1) ? '' : 's'
      }`}</b>
      {` for ${vote.proposalTitle}`}
    </div>
  );
};

export default VoteActivityItem;
