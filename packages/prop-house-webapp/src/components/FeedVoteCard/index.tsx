import { StoredVoteWithProposal } from '@nouns/prop-house-wrapper/dist/builders';
import EthAddress from '../EthAddress';
import classes from './FeedVoteCard.module.css';

const FeedVoteCard: React.FC<{ vote: StoredVoteWithProposal }> = props => {
  const { vote } = props;

  return (
    <div className={classes.feedRow}>
      <span className={classes.owner}>{<EthAddress address={vote.address} />}</span> voted{' '}
      {vote.weight} times for <span className={classes.propName}>{vote.proposal.title}</span>
    </div>
  );
};
export default FeedVoteCard;
