import RoundHeader from '../../components/RoundHeader';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import classes from './Round.module.css';
import LoadingIndicator from '../../components/LoadingIndicator';
import NotFound from '../../components/NotFound';
import { usePropHouse } from '@prophouse/sdk-react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import ProposalModal from '../../components/ProposalModal';
import OpenGraphElements from '../../components/OpenGraphElements';
import { markdownComponentToPlainText } from '../../utils/markdownToPlainText';
import { CardType, cardServiceUrl } from '../../utils/cardServiceUrl';
import ReactMarkdown from 'react-markdown';
import { setOnChainActiveProposals } from '../../state/slices/propHouse';
import RoundContent from '../../components/RoundContent';
import { setVoteAllotments } from '../../state/slices/voting';
import { resolveProposalTldrs } from '../../utils/resolveProposalTldrs';

const Round: React.FC<{}> = () => {
  const propHouse = usePropHouse();
  const dispatch = useAppDispatch();
  const round = useAppSelector(state => state.propHouse.activeRound);
  const house = useAppSelector(state => state.propHouse.activeHouse);
  const isModalActive = useAppSelector(state => state.propHouse.modalActive);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);

  const [loadingProposals, setLoadingProposals] = useState(false);
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
        const propsWithTldrs = await resolveProposalTldrs(proposals);
        dispatch(setOnChainActiveProposals(propsWithTldrs));
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
          description={markdownComponentToPlainText(<ReactMarkdown children={round.description} />)}
          imageUrl={cardServiceUrl(CardType.round, round.address).href}
        />
      )}
      {round && house && (
        <>
          <Container>
            <RoundHeader round={round} house={house} />
          </Container>
        </>
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
