import classes from './HouseProfImg.module.css';
import { Link } from 'react-router-dom';
import loadingNoun from '../../assets/loading-skull-noun.gif';
import { buildImageURL } from '../../utils/buildImageURL';
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
    <Link to={`/${house.address}`}>
      <img
        src={buildImageURL(house.imageURI)}
        crossOrigin="anonymous"
        alt="community profile"
        className={clsx(classes.img, hover && classes.hoverImg, className && className)}
      />
    </Link>
  ) : (
    <img
      src={loadingNoun}
      alt="community profile"
      className={clsx(classes.img, classes.loadingImg)}
    />
  );
};

export default HouseProfImg;
