import classes from './OpenGraphRoundCard.module.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import formatTime from '../../utils/formatTime';
import CommunityProfImg from '../CommunityProfImg';
import { deadlineTime, deadlineCopy } from '../../utils/auctionStatus';
import diffTime from '../../utils/diffTime';
import TruncateThousands from '../TruncateThousands';
import { Community, StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';

const OpenGraphRoundCard: React.FC = () => {
  const params = useParams();
  const { id } = params;

  const [round, setRound] = useState<StoredAuction>();
  const [community, setCommunity] = useState<Community>();

  const { library } = useEthers();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

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

              <div className={classes.date}>
                {`${formatTime(round.startTime)} - ${formatTime(round.proposalEndTime)}`}
              </div>
            </span>

            <span className={classes.houseImg}>
              <CommunityProfImg community={community} />
            </span>
          </span>

          <span className={classes.roundInfoContainer}>
            <div className={classes.roundInfo}>
              <span className={classes.proposedBy}>Funding:</span>
              <p className={classes.openGraphAvatar}>
                <TruncateThousands amount={round.fundingAmount} />
                {round.currencyType}
                <span className={classes.xDivide}>{' × '}</span> {round.numWinners}
              </p>
            </div>

            <div className={classes.roundInfo}>
              <span className={classes.proposedBy}>{deadlineCopy(round)}:</span>
              <p className={classes.openGraphAvatar}>{diffTime(deadlineTime(round))}</p>
            </div>
          </span>
        </div>
      )}
    </>
  );
};

export default OpenGraphRoundCard;
