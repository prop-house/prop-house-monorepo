import { useLocation } from 'react-router-dom';
import RoundHeader from '../../components/RoundHeader';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import classes from './Round.module.css';
import RoundUtilityBar from '../../components/RoundUtilityBar';
import LoadingIndicator from '../../components/LoadingIndicator';
import NotFound from '../../components/NotFound';
import { isMobile } from 'web3modal';
import { Proposal, RoundWithHouse, usePropHouse } from '@prophouse/sdk-react';
import TimedRoundContent from '../../components/RoundContent';

const Round = () => {
  const location = useLocation();
  const roundAddress = location.pathname.substring(1).split('/')[0];

  const propHouse = usePropHouse();
  const [round, setRound] = useState<RoundWithHouse>();
  const [proposals, setProposals] = useState<Proposal[]>();
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
        setRound(await propHouse.query.getRoundWithHouseInfo(roundAddress));
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
        // setProposals(await propHouse.query.getProposalsForRound(roundAddress));
        setProposals(await propHouse.query.getProposals());
      } catch (e) {
        setLoadingProposalsFailed(true);
      }
      setLoadingProposals(false);
    };
    fetchProposals();
  });

  return (
    <>
      {/* {modalActive && <ProposalModal />} */}
      {/* {round && (
        <OpenGraphElements
          title={round.title}
          description={markdownComponentToPlainText(<ReactMarkdown children={round.description} />)}
          imageUrl={cardServiceUrl(CardType.round, round.id).href}
        />
      )} */}
      {loadingRound ? (
        <LoadingIndicator height={isMobile() ? 416 : 332} />
      ) : loadingRoundFailed ? (
        <NotFound />
      ) : (
        round && (
          <>
            <Container>
              <RoundHeader round={round} />
            </Container>
            {/* <div className={classes.stickyContainer}>
              <Container>
                <RoundUtilityBar auction={round} />
              </Container>
            </div> */}
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
              round && proposals && <TimedRoundContent round={round} proposals={proposals} />
            )}
          </div>
        </Container>
      </div>
    </>
  );
};

export default Round;
