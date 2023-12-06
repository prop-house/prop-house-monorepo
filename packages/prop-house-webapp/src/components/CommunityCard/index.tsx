import { jsNumberForAddress } from 'react-jazzicon';
import classes from './CommunityCard.module.css';
import { House } from '@prophouse/sdk-react';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { isMobile } from 'web3modal';
import { FaStar } from 'react-icons/fa';
import { trophyColors } from '../../utils/trophyColors';
import { useFavoriteCommunities } from '../../hooks/useFavoriteCommunities';
import { buildImageURL } from '../../utils/buildImageURL';

const CommunityCard: React.FC<{
  house: House;
}> = props => {
  const { house } = props;
  const navigate = useNavigate();

  const {
    // eslint-disable-next-line
    favoriteCommunities,
    isFavoriteCommunity,
    addFavoriteCommunity,
    removeFavoriteCommunity,
  } = useFavoriteCommunities();

  const isFav = isFavoriteCommunity(house.address);

  const handleFav = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    isFav ? removeFavoriteCommunity(house.address) : addFavoriteCommunity(house.address);
  };

  return (
    <div onClick={() => navigate(`/${house.address}`)}>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.ten}
        classNames={clsx(classes.cardContainer, isMobile() && classes.whiteBg)}
        onHoverEffect={true}
      >
        <div className={classes.imgAndName}>
          {house.imageURI?.includes('prop.house') ? (
            <img
              src={buildImageURL(house.imageURI)}
              alt="house profile"
              className={classes.image}
            />
          ) : (
            <span style={{ marginRight: 6 }}>
              <Jazzicon diameter={20} seed={jsNumberForAddress(house.address)} />
            </span>
          )}
          <div className={classes.name}>{house.name}</div>
        </div>
        <div className={classes.star} onClick={e => handleFav(e)}>
          <FaStar color={isFav ? trophyColors('first') : 'gray'} size={20} />
        </div>
      </Card>
    </div>
  );
};

export default CommunityCard;
