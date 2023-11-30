import classes from './Communities.module.css';
import { House, usePropHouse } from '@prophouse/sdk-react';
import React, { useEffect, useState } from 'react';
import HouseProfImg from '../../components/HouseProfImg';
import { Col, Container, Row } from 'react-bootstrap';
import Card, { CardBgColor, CardBorderRadius } from '../../components/Card';
import dayjs from 'dayjs';
import Button, { ButtonColor } from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import { FaStar } from 'react-icons/fa';
import { useFavoriteCommunities } from '../../hooks/useFavoriteCommunities';
import { trophyColors } from '../../utils/trophyColors';

const Communities: React.FC = () => {
  const [houses, setHouses] = useState<House[]>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchMore, setFetchMore] = useState(false);
  const [noMoreAvail, setNoMoreAvail] = useState(false);

  const propHouse = usePropHouse();

  const {
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

  const sortHouses = (houses: House[]) => {
    return houses.sort((a, b) => {
      const isAInFavorites = isFavoriteCommunity(a.address);
      const isBInFavorites = isFavoriteCommunity(b.address);

      if (isAInFavorites && !isBInFavorites) {
        return -1;
      } else if (!isAInFavorites && isBInFavorites) {
        return 1;
      } else {
        return 0;
      }
    });
  };

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        setLoading(true);
        const fetchedHouses = await propHouse.query.getHouses({ page: page, perPage: 8 });
        setFetchMore(false);
        setLoading(false);

        if (fetchedHouses.length === 0) {
          setNoMoreAvail(true);
          return;
        }

        setPage(prev => prev + 1);
        setHouses(prev => {
          const houses = prev ? [...prev, ...fetchedHouses] : fetchedHouses;
          return sortHouses(houses);
        });
      } catch (error) {
        setFetchMore(false);
        setLoading(false);
        console.error('Error fetching houses:', error);
      }
    };
    fetchHouses();
  }, [fetchMore, page, propHouse.query]);

  const houseCard = (house: House) => {
    return (
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.ten}
        classNames={classes.houseCard}
        onHoverEffect={true}
      >
        <div className={classes.star} onClick={e => handleFav(e, house.address)}>
          <FaStar
            color={isFavoriteCommunity(house.address) ? trophyColors('first') : 'gray'}
            size={24}
          />
        </div>
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
    );
  };

  return (
    <Container>
      <PageHeader
        title="Communities"
        subtitle="Discover all the communities running on Prop House"
      />
      <Row>
        {houses &&
          houses.map((house, i) => (
            <Col key={i} xs={6} lg={3}>
              {houseCard(house)}
            </Col>
          ))}
      </Row>
      <Row className={classes.loadMoreRow}>
        <Button
          text={
            noMoreAvail
              ? 'No more communities available'
              : loading
              ? 'Loading...'
              : 'Load more communities'
          }
          bgColor={ButtonColor.PurpleLight}
          classNames={classes.loadMoreBtn}
          onClick={() => setFetchMore(true)}
          disabled={noMoreAvail || loading}
        />
      </Row>
    </Container>
  );
};

export default Communities;
