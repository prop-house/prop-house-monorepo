import classes from './CommunityProfImg.module.css';
import loadingNoun from '../../assets/loading-skull-noun.gif';
import { House } from '@prophouse/sdk-react';
import clsx from 'clsx';
import buildIpfsPath from '../../utils/buildIpfsPath';

// TODO: Move to utils
const extractIPFSContentID = (uri: string | undefined) => {
  return uri?.match('Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}')?.[0];
};

// The void noun is a placeholder image for houses that don't have a profile image
const FALLBACK_HOUSE_IMAGE_CID = 'bafkreialzck4dnbaa75ma25d2qhpy3ptav4o2o7awn2dxhzjntg25zbzoe';

const CommunityProfImg: React.FC<{
  community?: House;
  inactiveTokenURI?: string;
  hover?: boolean;
}> = props => {
  const { community, hover } = props;

  return community ? (
      <img
        crossOrigin="anonymous"
        src={buildIpfsPath(extractIPFSContentID(community.imageURI) ?? FALLBACK_HOUSE_IMAGE_CID)}
        alt="community profile"
        className={clsx(classes.img, hover && classes.hoverImg)}
      />
  ) : (
    <img
      src={loadingNoun}
      alt="community profile"
      className={clsx(classes.img, classes.loadingImg)}
    />
  );
};

export default CommunityProfImg;
