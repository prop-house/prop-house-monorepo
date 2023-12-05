import classes from './OpenGraphHouseCard.module.css';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { House, usePropHouse } from '@prophouse/sdk-react';
import HouseProfImg from '../HouseProfImg';
import dayjs from 'dayjs';

const OpenGraphHouseCard: React.FC = () => {
  const params = useParams();
  const { address } = params;

  const propHouse = usePropHouse();
  const [house, setHouse] = useState<House>();

  useEffect(() => {
    if (!address) return;
    const fetch = async () => {
      const community = await propHouse.query.getHouse(address);
      setHouse(community);
    };
    fetch();
  }, [address, propHouse.query]);

  return (
    <>
      {house && (
        <div className={classes.cardContainer}>
          <div className={classes.logo}>
            <span className={classes.houseText}>Prop House</span>
          </div>

          <span className={classes.infoAndImage}>
            <span className={classes.houseImg}>
              <HouseProfImg house={house} />
            </span>

            <span className={classes.houseInfoCountainer}>
              <div className={classes.roundName}>{house.name}</div>

              <span className={classes.roundInfoContainer}>
                <div className={classes.roundInfo}>
                  <span className={classes.title}>Created on </span>
                  <p className={classes.subtitle}>
                    {dayjs(house.createdAt * 1000).format('MMM D YYYY')}
                  </p>
                </div>
                <div className={classes.roundInfo}>
                  <span className={classes.title}>Rounds</span>
                  <p className={classes.subtitle}>{house.roundCount}</p>
                </div>
              </span>
            </span>
          </span>
        </div>
      )}
    </>
  );
};

export default OpenGraphHouseCard;
