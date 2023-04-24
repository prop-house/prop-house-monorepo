import classes from './OpenGraphRoundCard.module.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import formatTime from '../../utils/formatTime';
import CommunityProfImg from '../CommunityProfImg';
import TruncateThousands from '../TruncateThousands';
import { isTimedAuction } from '../../utils/auctionType';
import { House, Round, usePropHouse } from '@prophouse/sdk-react';

const OpenGraphRoundCard: React.FC = () => {
  const params = useParams();
  const { id } = params;

  const [round, setRound] = useState<Round>();
  const [community, setCommunity] = useState<House>();

  const propHouse = usePropHouse();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      const round = await propHouse.query.getRoundWithHouseInfo(id);
      if (round) {
        setRound(round);
        setCommunity(round.house);
      }
    };

    fetch();
  }, [id, propHouse.query]);

  return (
    <>
      {community && round && (
        <div className={classes.cardContainer}>
          <span className={classes.infoAndImage}>
            <span>
              <div className={classes.cardTitle}>
                <span className={classes.houseName}>{community.name} House</span>
              </div>

              <div className={classes.roundName}>{round.title}</div>
              {isTimedAuction(round) && (
                <div className={classes.date}>
                  {`${formatTime(round.config.proposalPeriodStartTimestamp)} - ${formatTime(round.config.proposalPeriodEndTimestamp)}`}
                </div>
              )}
            </span>

            <span className={classes.houseImg}>
              {/* TODO: Fix */}
              {/* <CommunityProfImg community={community} /> */}
            </span>
          </span>

          <span className={classes.roundInfoContainer}>
            <div className={classes.roundInfo}>
              <span className={classes.title}>Awards:</span>
              <p className={classes.subtitle}>
                {/* TODO: Handle awards */}
                {/* <TruncateThousands amount={round.fundingAmount} decimals={2} /> {round.currencyType} */}
                {isTimedAuction(round) && (
                  <>
                    <span className={classes.xDivide}>{' × '}</span> {round.config.winnerCount}
                  </>
                )}
              </p>
            </div>
          </span>
        </div>
      )}
    </>
  );
};

export default OpenGraphRoundCard;
