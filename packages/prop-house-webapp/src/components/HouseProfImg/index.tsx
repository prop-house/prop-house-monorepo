import classes from './HouseProfImg.module.css';
import { Link } from 'react-router-dom';
import loadingNoun from '../../assets/loading-skull-noun.gif';
import clsx from 'clsx';
import { House } from '@prophouse/sdk-react';

const HouseProfImg: React.FC<{
  house?: House;
  inactiveTokenURI?: string;
  hover?: boolean;
  className?: string;
}> = props => {
  const { house, hover, className } = props;

  return house ? (
    <Link to={`/${house.address}}`}>
      <img
        src={house.imageURI?.replace(/prophouse.mypinata.cloud/g, 'cloudflare-ipfs.com')}
        crossOrigin="anonymous"
        alt="community profile "
        className={clsx(classes.img, hover && classes.hoverImg, className && className)}
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

export default HouseProfImg;
