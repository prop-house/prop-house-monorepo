import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import RoundHeader from '../../components/RoundHeader';
import { useEffect, useRef, useState } from 'react';
import {
  filterInfRoundProposals,
  InfRoundFilterType,
  setActiveCommunity,
  setActiveProposals,
  setActiveRound,
  setInfRoundFilterType,
  setModalActive,
  sortTimedRoundProposals,
  TimedRoundSortType,
} from '../../state/slices/propHouse';
import { Container } from 'react-bootstrap';
import classes from './Round.module.css';
// import RoundUtilityBar from '../../components/RoundUtilityBar';
import RoundContent from '../../components/RoundContent';
import { nameToSlug, slugToName } from '../../utils/communitySlugs';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../../components/OpenGraphElements';
import { markdownComponentToPlainText } from '../../utils/markdownToPlainText';
import ReactMarkdown from 'react-markdown';
import ProposalModal from '../../components/ProposalModal';
import { useSigner } from 'wagmi';
import LoadingIndicator from '../../components/LoadingIndicator';
import NotFound from '../../components/NotFound';
import { isMobile } from 'web3modal';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { infRoundBalance } from '../../utils/infRoundBalance';
import { RoundState, usePropHouse } from '@prophouse/sdk-react';

const Round = () => {
  const location = useLocation();
  const [houseAddress, roundAddress] = location.pathname.substring(1).split('/');;

  const dispatch = useAppDispatch();

  const propHouse = usePropHouse();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const infRoundFilteredProposals = useAppSelector(
    state => state.propHouse.infRoundFilteredProposals,
  );
  const modalActive = useAppSelector(state => state.propHouse.modalActive);

  const isRoundOver = round?.state === RoundState.COMPLETE; // TODO: Handle claiming and cancelled
  const isVotingWindow = round?.state === RoundState.IN_VOTING_PERIOD;

  const [loadingRound, setLoadingRound] = useState(false);
  const [loadingComm, setLoadingComm] = useState(false);
  const [loadingCommFailed, setLoadingCommFailed] = useState(false);
  const [roundfailedFetch, setRoundFailedFetch] = useState(false);

  const [loadingProps, setLoadingProps] = useState(false);
  const [propsFailedFetch, setPropsFailedFetch] = useState(false);

  // If no data is found in store (ie round page is entry point), fetch data
  useEffect(() => {
    if (community) return;

    const fetchCommunity = async () => {
      try {
        setLoadingComm(true);

        const house = await propHouse.query.getHouse(houseAddress);

        dispatch(setActiveCommunity(house));
        setLoadingComm(false);
      } catch (e) {
        setLoadingComm(false);
        setLoadingCommFailed(true);
      }
    };

    fetchCommunity();
  }, [houseAddress, dispatch, roundAddress, round, community, propHouse.query]);

  // if no data is found in store (ie round page is entry point), fetch data
  useEffect(() => {
    if (round || !community) return;

    const fetchRound = async () => {
      try {
        setLoadingRound(true);

        const round = await propHouse.query.getRound(roundAddress);
        dispatch(setActiveRound(round));
        setLoadingRound(false);
      } catch (e) {
        setLoadingRound(false);
        setRoundFailedFetch(true);
      }
    };

    fetchRound();
  }, [houseAddress, dispatch, roundAddress, round, community, propHouse.query]);

  // Fetch proposals
  useEffect(() => {
    if (!round) return;

    const fetchAuctionProposals = async () => {
      try {
        setLoadingProps(true);

        const proposals = await propHouse.query.getProposalsForRound(round.address);
        dispatch(setActiveProposals(proposals));

        // set initial state for props (sorted in timed round / filtered in inf round)
        if (isTimedAuction(round)) {
          dispatch(
            sortTimedRoundProposals({
              sortType:
                isVotingWindow || isRoundOver
                  ? TimedRoundSortType.VoteCount
                  : TimedRoundSortType.CreatedAt,
              ascending: false,
            }),
          );
        } else {
          const infRoundOver = infRoundBalance(proposals, round) === 0;
          const filterType = infRoundOver ? InfRoundFilterType.Winners : InfRoundFilterType.Active;
          dispatch(setInfRoundFilterType(filterType));
          dispatch(filterInfRoundProposals({ type: filterType, round }));
        }

        setLoadingProps(false);
      } catch (e) {
        console.log({ e })
        setLoadingProps(false);
        setPropsFailedFetch(true);
      }
    };

    fetchAuctionProposals();

    return () => {
      dispatch(setInfRoundFilterType(InfRoundFilterType.Active));
      dispatch(setModalActive(false));
      dispatch(setActiveCommunity());
      dispatch(setActiveRound());
      dispatch(setActiveProposals([]));
    };
  }, [dispatch, isVotingWindow, isRoundOver, round, propHouse.query]);

  return (
    <>
      {modalActive && <ProposalModal />}

      {round && (
        // TODO: Implement
        <>
        </>
        // <OpenGraphElements
        //   title={round.title}
        //   description={markdownComponentToPlainText(<ReactMarkdown children={round.description} />)}
        //   imageUrl={cardServiceUrl(CardType.round, round.id).href}
        // />
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
              <RoundHeader round={round} community={community} />
            </Container>
            <div className={classes.stickyContainer}>
              <Container>
                {/* TODO: Implement */}
                {/* <RoundUtilityBar round={round} /> */}
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
            ) : propsFailedFetch ? (
              <NotFound />
            ) : (
              round && (
                <RoundContent
                  round={round}
                  proposals={
                    isInfAuction(round)
                      ? infRoundFilteredProposals
                        ? infRoundFilteredProposals
                        : []
                      : proposals
                      ? proposals
                      : []
                  }
                />
              )
            )}
          </div>
        </Container>
      </div>
    </>
  );
};

export default Round;
