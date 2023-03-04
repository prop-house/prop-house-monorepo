import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import RoundHeader from '../../components/RoundHeader';
import { useEffect, useRef, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import {
  setActiveCommunity,
  setActiveProposals,
  setActiveRound,
  setModalActive,
} from '../../state/slices/propHouse';
import { Container } from 'react-bootstrap';
import classes from './Round.module.css';
import RoundUtilityBar from '../../components/RoundUtilityBar';
import RoundContent from '../../components/RoundContent';
import { nameToSlug, slugToName } from '../../utils/communitySlugs';
import { dispatchSortProposals, SortType } from '../../utils/sortingProposals';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../../components/OpenGraphElements';
import { markdownComponentToPlainText } from '../../utils/markdownToPlainText';
import ReactMarkdown from 'react-markdown';
import ProposalModal from '../../components/ProposalModal';
import { useSigner } from 'wagmi';
import LoadingIndicator from '../../components/LoadingIndicator';
import NotFound from '../../components/NotFound';
import { isMobile } from 'web3modal';

const Round = () => {
  const location = useLocation();
  const communityName = location.pathname.substring(1).split('/')[0];
  const roundName = location.pathname.substring(1).split('/')[1];

  const dispatch = useAppDispatch();
  const { data: signer } = useSigner();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const host = useAppSelector(state => state.configuration.backendHost);
  const modalActive = useAppSelector(state => state.propHouse.modalActive);
  const client = useRef(new PropHouseWrapper(host));

  const isRoundOver = round && auctionStatus(round) === AuctionStatus.AuctionEnded;
  const isVotingWindow = round && auctionStatus(round) === AuctionStatus.AuctionVoting;

  const [loadingRound, setLoadingRound] = useState(false);
  const [loadingComm, setLoadingComm] = useState(false);
  const [loadingCommFailed, setLoadingCommFailed] = useState(false);
  const [roundfailedFetch, setRoundFailedFetch] = useState(false);

  const [loadingProps, setLoadingProps] = useState(false);
  const [propsFailedFetch, setPropsFailedFetch] = useState(false);

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  // if no data is found in store (ie round page is entry point), fetch data
  useEffect(() => {
    if (community) return;

    const fetchCommunity = async () => {
      try {
        setLoadingComm(true);
        const community = await client.current.getCommunityWithName(slugToName(communityName));
        dispatch(setActiveCommunity(community));

        setLoadingComm(false);
      } catch (e) {
        setLoadingComm(false);
        setLoadingCommFailed(true);
      }
    };

    fetchCommunity();
  }, [communityName, dispatch, roundName, round, community]);

  // if no data is found in store (ie round page is entry point), fetch data
  useEffect(() => {
    if (round || !community) return;

    const fetchRound = async () => {
      try {
        setLoadingRound(true);

        const round = await client.current.getAuctionWithNameForCommunity(
          nameToSlug(roundName),
          community.id,
        );
        dispatch(setActiveRound(round));
        setLoadingRound(false);
      } catch (e) {
        setLoadingRound(false);
        setRoundFailedFetch(true);
      }
    };

    fetchRound();
  }, [communityName, dispatch, roundName, round, community]);

  // fetch proposals
  useEffect(() => {
    if (!round) return;

    const fetchAuctionProposals = async () => {
      try {
        setLoadingProps(true);

        const proposals = await client.current.getAuctionProposals(round.id);
        dispatch(setActiveProposals(proposals));

        // if the round is in voting state or over we sort by votes, otherwise we sort by created date
        isVotingWindow || isRoundOver
          ? dispatchSortProposals(dispatch, SortType.VoteCount, false)
          : dispatchSortProposals(dispatch, SortType.CreatedAt, false);

        setLoadingProps(false);
      } catch (e) {
        setLoadingProps(false);
        setPropsFailedFetch(true);
      }
    };

    fetchAuctionProposals();

    return () => {
      dispatch(setModalActive(false));
      dispatch(setActiveCommunity());
      dispatch(setActiveRound());
      dispatch(setActiveProposals([]));
    };
  }, [dispatch, isVotingWindow, isRoundOver, round]);

  return (
    <>
      {modalActive && <ProposalModal />}

      {round && (
        <OpenGraphElements
          title={round.title}
          description={markdownComponentToPlainText(<ReactMarkdown children={round.description} />)}
          imageUrl={cardServiceUrl(CardType.round, round.id).href}
        />
      )}

      {loadingComm || loadingRound ? (
        <LoadingIndicator height={isMobile() ? 416 : 332} />
      ) : loadingCommFailed || roundfailedFetch ? (
        <NotFound />
      ) : (
        community &&
        round && (
          <>
            <Container>
              <RoundHeader auction={round} community={community} />
            </Container>
            <div className={classes.stickyContainer}>
              <Container>
                <RoundUtilityBar auction={round} />
              </Container>
            </div>
          </>
        )
      )}

      <div className={classes.roundContainer}>
        <Container className={classes.cardsContainer}>
          <div className={classes.propCards}>
            {loadingProps ? (
              <div className={classes.loader}>
                <LoadingIndicator />
              </div>
            ) : !loadingProps && propsFailedFetch ? (
              <NotFound />
            ) : (
              round && proposals && <RoundContent auction={round} proposals={proposals} />
            )}
          </div>
        </Container>
      </div>
    </>
  );
};

export default Round;
