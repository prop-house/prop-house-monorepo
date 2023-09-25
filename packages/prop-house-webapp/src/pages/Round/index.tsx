import { useLocation } from 'react-router-dom';
import RoundHeader from '../../components/RoundHeader';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import classes from './Round.module.css';
import RoundUtilityBar from '../../components/RoundUtilityBar';
import LoadingIndicator from '../../components/LoadingIndicator';
import NotFound from '../../components/NotFound';
import { isMobile } from 'web3modal';
import { RoundState, usePropHouse } from '@prophouse/sdk-react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import ProposalModal from '../../components/ProposalModal';
import OpenGraphElements from '../../components/OpenGraphElements';
import { markdownComponentToPlainText } from '../../utils/markdownToPlainText';
import { CardType, cardServiceUrl } from '../../utils/cardServiceUrl';
import ReactMarkdown from 'react-markdown';
import {
  setOnChainActiveProposals,
  setOnchainActiveHouse,
  setOnchainActiveRound,
} from '../../state/slices/propHouse';
import RoundContent from '../../components/RoundContent';

const Round = () => {
  const location = useLocation();
  const roundAddress = location.pathname.substring(1).split('/')[0];
  const isModalActive = useAppSelector(state => state.propHouse.modalActive);

  const propHouse = usePropHouse();

  const dispatch = useAppDispatch();
  const round = useAppSelector(state => state.propHouse.onchainActiveRound);
  const house = useAppSelector(state => state.propHouse.onchainActiveHouse);
  const proposals = useAppSelector(state => state.propHouse.onchainActiveProposals);

  const [loadingRound, setLoadingRound] = useState(false);
  const [loadingRoundFailed, setLoadingRoundFailed] = useState(false);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [loadingProposalsFailed, setLoadingProposalsFailed] = useState(false);

  // fetch round
  useEffect(() => {
    if (round) return;
    const fetchRound = async () => {
      try {
        setLoadingRound(true);
        const round = await propHouse.query.getRoundWithHouseInfo(roundAddress);
        // r.config.proposalPeriodStartTimestamp = 1695233984;
        round.state = RoundState.IN_PROPOSING_PERIOD;

        dispatch(setOnchainActiveRound(round));
        dispatch(setOnchainActiveHouse(round.house));
      } catch (e) {
        setLoadingRoundFailed(true);
      }
      setLoadingRound(false);
    };
    fetchRound();
  });

  // fetch proposals
  useEffect(() => {
    if (proposals) return;
    const fetchProposals = async () => {
      try {
        setLoadingProposals(true);
        const proposals = await propHouse.query.getProposalsForRound(roundAddress);
        // const proposals = await propHouse.query.getProposalsForRound(
        //   '0x1ce6b228a221f80cddbf2de526d38e2041934dd8',
        // );
        dispatch(setOnChainActiveProposals(proposals));
      } catch (e) {
        setLoadingProposalsFailed(true);
      }
      setLoadingProposals(false);
    };
    fetchProposals();
  });

  return (
    <>
      {isModalActive && proposals && <ProposalModal proposals={proposals} />}
      {round && (
        <OpenGraphElements
          title={round.title}
          description={markdownComponentToPlainText(<ReactMarkdown children={round.description} />)}
          imageUrl={cardServiceUrl(CardType.round, round.address).href}
        />
      )}
      {loadingRound ? (
        <LoadingIndicator height={isMobile() ? 416 : 332} />
      ) : loadingRoundFailed ? (
        <NotFound />
      ) : (
        round &&
        house && (
          <>
            <Container>
              <RoundHeader round={round} house={house} />
            </Container>
            <div className={classes.stickyContainer}>
              <Container>
                <RoundUtilityBar round={round} />
              </Container>
            </div>
          </>
        )
      )}
      <div className={classes.roundContainer}>
        <Container className={classes.cardsContainer}>
          <div className={classes.propCards}>
            {loadingProposals ? (
              <div className={classes.loader}>
                <LoadingIndicator />
              </div>
            ) : loadingProposalsFailed ? (
              <NotFound />
            ) : (
              round && proposals && <RoundContent round={round} proposals={proposals} />
            )}
          </div>
        </Container>
      </div>
    </>
  );
};

export default Round;
