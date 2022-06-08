import classes from './CommunityCard.module.css';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import CommunityProfImg from '../CommunityProfImg';

const CommunityCard: React.FC<{
  community: Community;
}> = (props) => {
  const { community } = props;

  return (
    <div className={classes.container}>
      <CommunityProfImg community={community} />
      <div className={classes.infoContainer}>
        <div className={classes.title}>{community.name}</div>
        <div className={classes.proposals}>
          <span>{community.numProposals}</span>{" "}
          {community.numProposals === 1 ? "prop" : "props"}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
