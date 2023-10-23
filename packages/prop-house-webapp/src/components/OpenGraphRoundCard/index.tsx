import classes from './OpenGraphRoundCard.module.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import formatTime from '../../utils/formatTime';
import TruncateThousands from '../TruncateThousands';
import { Community, StoredTimedAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { useEthersSigner } from '../../hooks/useEthersSigner';
import { isTimedAuction } from '../../utils/auctionType';

const OpenGraphRoundCard: React.FC = () => {
  const params = useParams();
  const { id } = params;

  const [round, setRound] = useState<StoredTimedAuction>();
  const [community, setCommunity] = useState<Community>();

  const signer = useEthersSigner();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      const round = await client.current.getAuction(Number(id));
      const community = await client.current.getCommunityWithId(round.community);
      setRound(round);
      setCommunity(community);
    };

    fetch();
  }, [id]);

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
                  {`${formatTime(round.startTime)} - ${formatTime(round.proposalEndTime)}`}
                </div>
              )}
            </span>

            <span className={classes.houseImg}>
              {/* todo: resolve */}
              {/* <CommunityProfImg community={community} /> */}
            </span>
          </span>

          <span className={classes.roundInfoContainer}>
            <div className={classes.roundInfo}>
              <span className={classes.title}>Awards:</span>
              <p className={classes.subtitle}>
                <TruncateThousands amount={round.fundingAmount} decimals={2} /> {round.currencyType}
                {isTimedAuction(round) && (
                  <>
                    <span className={classes.xDivide}>{' × '}</span> {round.numWinners}
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
