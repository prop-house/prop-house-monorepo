import classes from './CommunityCard.module.css';
import { Link } from 'react-router-dom';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';

const CommunityCard: React.FC<{
  community: Community;
}> = (props) => {
  const { community } = props;

  return (
    <div className={classes.container}>
      <Link to={`/${community.contractAddress}`}>
        <img
          src={community.profileImageUrl}
          alt="community profile "
          className={classes.imageCard}
        />
      </Link>
      <div className={classes.infoContainer}>
        <div className={classes.title}>{community.name}</div>
        <div className={classes.proposals}>
          <span>{community.numProposals}</span> props
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
