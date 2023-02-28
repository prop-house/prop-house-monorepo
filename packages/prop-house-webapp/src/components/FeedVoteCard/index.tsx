import { StoredVoteWithProposal } from '@nouns/prop-house-wrapper/dist/builders';
import { useNavigate } from 'react-router-dom';
import EthAddress from '../EthAddress';
import classes from './FeedVoteCard.module.css';

const FeedVoteCard: React.FC<{ vote: StoredVoteWithProposal }> = props => {
  const { vote } = props;

  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate(`proposal/${vote.id}`);
  };

  return (
    <div className={classes.feedRow}>
      <div className={classes.content}>
        {<EthAddress address={vote.address} addAvatar={true} className={classes.owner} />}
        {`cast ${vote.weight} votes for`}
        <span className={classes.propName} onClick={() => handleOnClick()}>
          {vote.proposal.title}
        </span>
      </div>
    </div>
  );
};
export default FeedVoteCard;
