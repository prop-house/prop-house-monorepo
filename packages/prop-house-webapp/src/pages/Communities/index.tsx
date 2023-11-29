import classes from './Communities.module.css';
import { House, usePropHouse } from '@prophouse/sdk-react';
import React, { useEffect, useState } from 'react';
import HouseProfImg from '../../components/HouseProfImg';
import { Col, Container, Row } from 'react-bootstrap';
import Card, { CardBgColor, CardBorderRadius } from '../../components/Card';
import dayjs from 'dayjs';
import Button, { ButtonColor } from '../../components/Button';

const Communities: React.FC = () => {
  const [houses, setHouses] = useState<House[]>();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchMore, setFetchMore] = useState(false);
  const [noMoreAvail, setNoMoreAvail] = useState(false);

  const propHouse = usePropHouse();

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
          if (prev) return [...prev, ...fetchedHouses];
          return fetchedHouses;
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
      <Row className={classes.headerRow}>
        <h1 className={classes.pageTitle}>Communities</h1>
        <p className={classes.pageSubtitle}>Discover all the communities running on Prop House</p>
      </Row>
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
