import classes from './OpenGraphRoundCard.module.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setActiveCommunity, setActiveRound } from '../../state/slices/propHouse';

import { nameToSlug, slugToName } from '../../utils/communitySlugs';
import formatTime from '../../utils/formatTime';
import CommunityProfImg from '../CommunityProfImg';
import {
  //  DeadlineCopy,
  deadlineTime,
} from '../../utils/auctionStatus';
import diffTime from '../../utils/diffTime';
import TruncateThousands from '../TruncateThousands';

const OpenGraphRoundCard: React.FC = () => {
  const location = useLocation();
  const communityName = location.pathname.substring(1).split('/')[0];
  const roundName = location.pathname.substring(1).split('/')[1];

  const dispatch = useAppDispatch();
  const { library } = useEthers();

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // if no round is found in store (ie round page is entry point), fetch community and round
  useEffect(() => {
    const fetchCommunityAndRound = async () => {
      const community = await client.current.getCommunityWithName(slugToName(communityName));
      const round = await client.current.getAuctionWithNameForCommunity(
        nameToSlug(roundName),
        community.id,
      );

      dispatch(setActiveCommunity(community));
      dispatch(setActiveRound(round));
    };

    if (!round) fetchCommunityAndRound();
  }, [communityName, dispatch, roundName, round]);

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
              {/* fix hook render issue */}
              <span className={classes.proposedBy}>{`DeadlineCopy(round)`}:</span>
              <p className={classes.openGraphAvatar}>{diffTime(deadlineTime(round))}</p>
            </div>
          </span>
        </div>
      )}
    </>
  );
};

export default OpenGraphRoundCard;
