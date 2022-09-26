import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import RoundHeader from '../../RoundHeader';
import { useEffect, useRef, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import {
  setActiveRound,
  setActiveCommunity,
  setActiveProposals,
} from '../../../state/slices/propHouse';
import dayjs from 'dayjs';
import { slugToName } from '../../../utils/communitySlugs';
import LoadingIndicator from '../../LoadingIndicator';
import NotFound from '../../NotFound';
import { Container } from 'react-bootstrap';
import classes from './Round.module.css';
import RoundMessage from '../../RoundMessage';
import RoundUtilityBar from '../../RoundUtilityBar';
import FullRound from '../../FullRound';

const Round = () => {
  const location = useLocation();
  const slug = location.pathname.substring(1).split('/')[0];
  const roundFromSlug = location.pathname.substring(1).split('/')[1];
  const isValidAddress = slug && ethers.utils.isAddress(slug);
  const dispatch = useAppDispatch();
  const { library } = useEthers();
  const [failedFetch, setFailedFetch] = useState(false);
  const cleanedUp = useRef(false);
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const activeAuction = useAppSelector(state => state.propHouse.activeRound);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch community
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        // fetch by address or name
        const community = isValidAddress
          ? await client.current.getCommunity(slug)
          : await client.current.getCommunityWithName(slugToName(slug));

        community.auctions.sort((a, b) => (dayjs(a.createdDate) < dayjs(b.createdDate) ? 1 : -1));

        const currentRound = location.state
          ? community.auctions.filter(round => round.id === location.state.round.id)
          : community.auctions.filter(
              round => round.title.toLowerCase() === slugToName(roundFromSlug),
            );

        if (cleanedUp.current) return; // assures late async call doesn't set state on unmounted comp
        dispatch(setActiveCommunity(community));

        dispatch(setActiveRound(...currentRound));
      } catch (e) {
        setFailedFetch(true);
      }
    };
    fetchCommunity();
    return () => {
      cleanedUp.current = true;
      dispatch(setActiveCommunity());
      dispatch(setActiveRound());
      dispatch(setActiveProposals([]));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, dispatch, isValidAddress, roundFromSlug]);

  if (!community && !failedFetch) return <LoadingIndicator />;
  if (!isValidAddress && failedFetch) return <NotFound />;

  return (
    <>
      <Container>
        {community && activeAuction && (
          <RoundHeader auction={activeAuction} community={community} />
        )}
      </Container>

      {activeAuction && (
        <div className={classes.stickyContainer}>
          <Container>
            <RoundUtilityBar auction={activeAuction} />
          </Container>
        </div>
      )}

      <div style={{ background: '#f5f5f5' }}>
        <Container className={classes.cardsContainer}>
          <div className={classes.propCards}>
            {activeAuction ? (
              <FullRound auction={activeAuction} />
            ) : (
              <RoundMessage message="No rounds available" />
            )}
          </div>
        </Container>
      </div>
    </>
  );
};

export default Round;
