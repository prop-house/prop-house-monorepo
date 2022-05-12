import classes from './CommunityProfImg.module.css';
import { Link } from 'react-router-dom';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import deadNoun from '../../assets/dead-noun.png';

const CommunityProfImg: React.FC<{
  community?: Community;
  inactiveTokenURI?: string;
}> = (props) => {
  const { community } = props;
  return community ? (
    <Link to={`/${community.contractAddress}`}>
      <img
        src={community.profileImageUrl}
        alt="community profile "
        className={classes.img}
      />
    </Link>
  ) : (
    <img src={deadNoun} alt="community profile " className={classes.img} />
  );
};

export default CommunityProfImg;
