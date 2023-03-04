import { StoredVoteWithProposal } from '@nouns/prop-house-wrapper/dist/builders';
import { useNavigate } from 'react-router-dom';
import EthAddress from '../EthAddress';
import classes from './FeedVoteCard.module.css';

const FeedVoteCard: React.FC<{ vote: StoredVoteWithProposal }> = props => {
  const { vote } = props;

  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate(`../proposal/${vote.proposalId}`);
  };

  return (
    <div className={classes.feedRow} onClick={() => handleOnClick()}>
      <div className={classes.content}>
        <EthAddress
          address={vote.address}
          addAvatar={true}
          containerClassName={classes.ethAddressContainer}
          className={classes.owner}
        />
        {'cast'}
        <span className={classes.voteWeight}>&nbsp;{vote.weight}&nbsp;</span>
        {' votes for '}
        <span className={classes.propName}>{vote.proposal.title}</span>
      </div>
    </div>
  );
};
export default FeedVoteCard;
