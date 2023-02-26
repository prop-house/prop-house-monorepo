import { StoredVoteWithProposal } from '@nouns/prop-house-wrapper/dist/builders';
import { useNavigate } from 'react-router-dom';
import EthAddress from '../EthAddress';
import classes from './FeedVoteCard.module.css';

const FeedVoteCard: React.FC<{ vote: StoredVoteWithProposal }> = props => {
  const { vote } = props;

  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate('/proposal/1');
  };

  return (
    <div className={classes.feedRow}>
      <span className={classes.owner}>{<EthAddress address={vote.address} />}</span> voted{' '}
      {vote.weight} times for{' '}
      <span className={classes.propName} onClick={() => handleOnClick()}>
        {vote.proposal.title}
      </span>
    </div>
  );
};
export default FeedVoteCard;
