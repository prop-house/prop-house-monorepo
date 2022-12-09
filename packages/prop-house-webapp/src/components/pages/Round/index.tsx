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
import ErrorMessageCard from '../../ErrorMessageCard';
import RoundUtilityBar from '../../RoundUtilityBar';
import RoundContent from '../../RoundContent';
import { nameToSlug, slugToName } from '../../../utils/communitySlugs';
import { dispatchSortProposals, SortType } from '../../../utils/sortingProposals';
import { AuctionStatus, auctionStatus } from '../../../utils/auctionStatus';
import { cardServiceUrl, CardType } from '../../../utils/cardServiceUrl';
import OpenGraphElements from '../../OpenGraphElements';
import { markdownComponentToPlainText } from '../../../utils/markdownToPlainText';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

const Round = () => {
  const location = useLocation();
  const communityName = location.pathname.substring(1).split('/')[0];
  const roundName = location.pathname.substring(1).split('/')[1];
  const fromProposalPage = location.state && location.state.fromProposalPage;

  const dispatch = useAppDispatch();
  const { library } = useEthers();

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const { t } = useTranslation();

  const isRoundOver = round && auctionStatus(round) === AuctionStatus.AuctionEnded;

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

      // default sorting method is random, but if user is navigating back from the proposal page we sort by date (which is the order the user is viewing the props in the modal), however if the auction is over we sort by votes
      fromProposalPage && !isRoundOver
        ? dispatchSortProposals(dispatch, SortType.CreatedAt, false)
        : dispatchSortProposals(
            dispatch,
            auctionStatus(round) === AuctionStatus.AuctionEnded ||
              auctionStatus(round) === AuctionStatus.AuctionVoting
              ? SortType.VoteCount
              : SortType.CreatedAt,
            false,
          );
    };
    fetchAuctionProposals();
    return () => {
      dispatch(setActiveProposals([]));
    };
  }, [dispatch, fromProposalPage, isRoundOver, round]);

  return (
    <>
      {round && (
        <OpenGraphElements
          title={round.title}
          description={markdownComponentToPlainText(<ReactMarkdown children={round.description} />)}
          imageUrl={cardServiceUrl(CardType.round, round.id).href}
        />
      )}

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
              <ErrorMessageCard message={t('noRoundsAvailable')} />
            )}
          </div>
        </Container>
      </div>
    </>
  );
};

export default Round;
