import RoundHeader from '../../components/RoundHeader';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import classes from './Round.module.css';
import NotFound from '../../components/NotFound';
import { usePropHouse } from '@prophouse/sdk-react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import ProposalModal from '../../components/ProposalModal';
import OpenGraphElements from '../../components/OpenGraphElements';
import { CardType, cardServiceUrl } from '../../utils/cardServiceUrl';
import { setOnChainActiveProposals } from '../../state/slices/propHouse';
import RoundContent from '../../components/RoundContent';
import { setVoteAllotments } from '../../state/slices/voting';
import { removeHtmlFromString } from '../../utils/removeHtmlFromString';
import { RoundOrHouseContentLoadingCard } from '../../components/LoadingCards';

const Round: React.FC<{}> = () => {
  const propHouse = usePropHouse();
  const dispatch = useAppDispatch();
  const round = useAppSelector(state => state.propHouse.activeRound);
  const house = useAppSelector(state => state.propHouse.activeHouse);
  const isModalActive = useAppSelector(state => state.propHouse.modalActive);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);

  const [loadingProposals, setLoadingProposals] = useState<boolean>();
  const [loadedProposals, setLoadedProposals] = useState(false);
  const [loadingProposalsFailed, setLoadingProposalsFailed] = useState(false);

  // fetch proposals
  useEffect(() => {
    if (proposals || loadedProposals || !round) return;

    const fetchProposals = async () => {
      try {
        setLoadingProposals(true);
        const proposals = await propHouse.query.getProposalsForRound(round.address, {
          where: { isCancelled: false },
        });
        dispatch(setOnChainActiveProposals(proposals));
      } catch (e) {
        setLoadingProposalsFailed(true);
      }
      setLoadingProposals(false);
      setLoadedProposals(true);
    };
    fetchProposals();
    return () => {
      dispatch(setVoteAllotments([]));
      dispatch(setOnChainActiveProposals(undefined));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isModalActive && proposals && <ProposalModal proposals={proposals} />}
      {round && (
        <OpenGraphElements
          title={round.title}
          description={removeHtmlFromString(round.description)}
          imageUrl={cardServiceUrl(CardType.round, round.address).href}
        />
      )}
      {round && house && (
        <>
          <Container>
            <RoundHeader round={round} house={house} />
          </Container>
          <div className={classes.roundContainer}>
            <Container className={classes.cardsContainer}>
              {loadingProposals ? (
                <RoundOrHouseContentLoadingCard />
              ) : loadingProposalsFailed ? (
                <NotFound />
              ) : (
                <div className={classes.propCards}>
                  {proposals && <RoundContent round={round} house={house} proposals={proposals} />}
                </div>
              )}
            </Container>
          </div>
        </>
      )}
    </>
  );
};

export default Round;
