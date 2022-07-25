import classes from './CommunityProfImg.module.css';
import { Link } from 'react-router-dom';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import loadingNoun from '../../assets/loading-skull-noun.gif';
import clsx from 'clsx';
import { nameToSlug } from '../../utils/communitySlugs';

const CommunityProfImg: React.FC<{
  community?: Community;
  inactiveTokenURI?: string;
  hover?: boolean;
}> = props => {
  const { community, hover } = props;

  return community ? (
    <Link to={`/${nameToSlug(community.name)}`}>
      <img
        src={community.profileImageUrl}
        alt="community profile "
        className={clsx(classes.img, hover && classes.hoverImg)}
      />
    </Link>
  ) : (
    <img
      src={loadingNoun}
      alt="community profile "
      className={clsx(classes.img, classes.loadingImg)}
    />
  );
};

export default CommunityProfImg;
