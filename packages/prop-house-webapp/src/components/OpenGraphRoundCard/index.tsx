import classes from './OpenGraphRoundCard.module.css';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { House, Round, usePropHouse } from '@prophouse/sdk-react';
import dayjs from 'dayjs';
import HouseProfImg from '../HouseProfImg';

const OpenGraphRoundCard: React.FC = () => {
  const params = useParams();
  const { address } = params;
  const propHouse = usePropHouse();

  const [round, setRound] = useState<Round>();
  const [house, setHouse] = useState<House>();

  useEffect(() => {
    if (!address) return;

    const fetch = async () => {
      const round = await propHouse.query.getRoundWithHouseInfo(address);
      setRound(round);
      setHouse(round.house);
    };

    fetch();
  }, [address, propHouse.query]);

  return (
    <>
      {house && round && (
        <div className={classes.cardContainer}>
          <span className={classes.infoAndImage}>
            <span>
              <div className={classes.cardTitle}>
                <span className={classes.houseName}>{house.name}</span>
              </div>

              <div className={classes.roundName}>{round.title}</div>

              <div className={classes.date}>
                {`${dayjs(round.config.proposalPeriodStartTimestamp * 1000).format(
                  'MMM D @ h:mmA',
                )} - ${dayjs(round.config.votePeriodEndTimestamp * 1000).format('MMM D @ h:mmA')}`}
              </div>
            </span>

            <span className={classes.houseImg}>
              <HouseProfImg house={house} />
            </span>
          </span>
        </div>
      )}
    </>
  );
};

export default OpenGraphRoundCard;
