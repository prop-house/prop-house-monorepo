import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import RoundHeader from '../../RoundHeader';
import { useEffect, useRef } from 'react';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import {
  setActiveCommunity,
  setActiveProposals,
  setActiveRound,
} from '../../../state/slices/propHouse';
import { Container } from 'react-bootstrap';
import classes from './Round.module.css';
import RoundMessage from '../../RoundMessage';
import RoundUtilityBar from '../../RoundUtilityBar';
import RoundContent from '../../RoundContent';
import { nameToSlug, slugToName } from '../../../utils/communitySlugs';
import { dispatchSortProposals, SortType } from '../../../utils/sortingProposals';
import { AuctionStatus, auctionStatus } from '../../../utils/auctionStatus';

const Round = () => {
  const location = useLocation();
  const communityName = location.pathname.substring(1).split('/')[0];
  const roundName = location.pathname.substring(1).split('/')[1];

  const dispatch = useAppDispatch();
  const { library } = useEthers();

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
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

  // fetch proposals
  useEffect(() => {
    if (!round) return;

    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getAuctionProposals(round.id);
      dispatch(setActiveProposals(proposals));

      // default sorting method is random, unless the auction is over, in which case its by votes
      dispatchSortProposals(
        dispatch,
        auctionStatus(round) === AuctionStatus.AuctionEnded ? SortType.VoteCount : SortType.Random,
        false,
      );
    };
    fetchAuctionProposals();
    return () => {
      dispatch(setActiveProposals([]));
    };
  }, [dispatch, round]);

  return (
    <>
      <Container>
        {community && round && <RoundHeader auction={round} community={community} />}
      </Container>

      {round && (
        <div className={classes.stickyContainer}>
          <Container>
            <RoundUtilityBar auction={round} />
          </Container>
        </div>
      )}

      <div className={classes.roundContainer}>
        <Container className={classes.cardsContainer}>
          <div className={classes.propCards}>
            {round && proposals ? (
              <RoundContent auction={round} proposals={proposals} />
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
