import classes from './CommunityProfImg.module.css';
import { Link } from 'react-router-dom';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';

const CommunityProfImg: React.FC<{ community: Community }> = (props) => {
  const { community } = props;
  return (
    <Link to={`/${community.contractAddress}`}>
      <img
        src={community.profileImageUrl}
        alt="community profile "
        className={classes.img}
      />
    </Link>
  );
};

export default CommunityProfImg;
