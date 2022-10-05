import classes from './OpenGraphHouseCard.module.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setActiveCommunity } from '../../state/slices/propHouse';
import { slugToName } from '../../utils/communitySlugs';
import CommunityProfImg from '../CommunityProfImg';

const OpenGraphHouseCard: React.FC = () => {
  const location = useLocation();
  const slug = location.pathname.substring(1).split('/')[0];

  const { library } = useEthers();
  const dispatch = useAppDispatch();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch community
  useEffect(() => {
    const fetchCommunity = async () => {
      const community = await client.current.getCommunityWithName(slugToName(slug));
      dispatch(setActiveCommunity(community));
    };
    fetchCommunity();
  }, [slug, dispatch]);

  return (
    <>
      {community && (
        <div className={classes.cardContainer}>
          <div className={classes.logo}>
            <img src="/bulb.png" alt="bulb" />
            <span className={classes.propText}>Prop</span>{' '}
            <span className={classes.houseText}>House</span>
          </div>

          <span className={classes.infoAndImage}>
            <span className={classes.houseImg}>
              <CommunityProfImg community={community} />
            </span>

            <span className={classes.houseInfoCountainer}>
              <div className={classes.roundName}>{community.name}</div>

              <span className={classes.roundInfoContainer}>
                <div className={classes.roundInfo}>
                  <span className={classes.title}>Rounds</span>
                  <p className={classes.subtitle}>{community.numAuctions}</p>
                </div>

                <div className={classes.roundInfo}>
                  <span className={classes.title}>Proposals</span>
                  <p className={classes.subtitle}>{community.numProposals}</p>
                </div>
                <div className={classes.roundInfo}>
                  <span className={classes.title}>Funded</span>
                  <p className={classes.subtitle}>{community.ethFunded}</p>
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
