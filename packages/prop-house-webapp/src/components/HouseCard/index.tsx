import classes from './HouseCard.module.css';
import { House } from '@prophouse/sdk-react';
import { useNavigate } from 'react-router-dom';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { useFavoriteCommunities } from '../../hooks/useFavoriteCommunities';
import { FaStar } from 'react-icons/fa';
import HouseProfImg from '../HouseProfImg';
import dayjs from 'dayjs';
import { trophyColors } from '../../utils/trophyColors';

const HouseCard: React.FC<{ house: House; favHandling?: boolean; pathTo: 'page' | 'manager' }> = ({
  house,
  favHandling,
  pathTo,
}) => {
  const navigate = useNavigate();
  const {
    // eslint-disable-next-line
    favoriteCommunities,
    isFavoriteCommunity,
    addFavoriteCommunity,
    removeFavoriteCommunity,
  } = useFavoriteCommunities();

  const handleFav = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, houseAddress: string) => {
    e.stopPropagation();
    isFavoriteCommunity(houseAddress)
      ? removeFavoriteCommunity(houseAddress)
      : addFavoriteCommunity(houseAddress);
  };

  return (
    <div
      onClick={() =>
        navigate(pathTo === 'page' ? `/${house.address}` : `/manage/house/${house.address}`, {
          state: { house },
        })
      }
    >
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.ten}
        classNames={classes.houseCard}
        onHoverEffect={true}
      >
        {favHandling && (
          <div className={classes.star} onClick={e => handleFav(e, house.address)}>
            <FaStar
              color={isFavoriteCommunity(house.address) ? trophyColors('first') : 'gray'}
              size={24}
            />
          </div>
        )}

        <HouseProfImg house={house} className={classes.houseProfImg} />
        <div className={classes.title}>{house.name}</div>
        <div className={classes.houseDataContainer}>
          <div className={classes.houseDataItem}>
            <span>Created </span>
            <span>{dayjs(house.createdAt * 1000).format('MMM D YYYY')}</span>
          </div>
          <div className={classes.houseDataItem}>
            <span>Total rounds </span>
            <span>{house.roundCount}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HouseCard;
