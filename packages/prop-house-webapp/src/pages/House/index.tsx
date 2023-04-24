import classes from './House.module.css';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import HouseHeader from '../../components/HouseHeader';
import { useEffect, useState } from 'react';
import { setActiveCommunity } from '../../state/slices/propHouse';
import { Col, Container, Row } from 'react-bootstrap';
import RoundCard from '../../components/RoundCard';
import HouseUtilityBar from '../../components/HouseUtilityBar';
// import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessageCard from '../../components/ErrorMessageCard';
import NoSearchResults from '../../components/NoSearchResults';
import NotFound from '../../components/NotFound';
import { sortRoundByState } from '../../utils/sortRoundByState';
import { RoundStatus } from '../../components/StatusFilters';
import OpenGraphElements from '../../components/OpenGraphElements';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import ReactMarkdown from 'react-markdown';
import { markdownComponentToPlainText } from '../../utils/markdownToPlainText';
import { GetRoundStateParams, Round, RoundState, RoundType, TimedFunding, usePropHouse } from '@prophouse/sdk-react';
import { useTranslation } from 'react-i18next';
import { isMobile } from 'web3modal';

const House = () => {
  const location = useLocation();
  const address = location.pathname.substring(1, location.pathname.length);

  const propHouse = usePropHouse();
  // const { data: signer } = useSigner();

  const dispatch = useAppDispatch();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  // const client = useRef(new PropHouseWrapper(host));

  const [rounds, setRounds] = useState<Round[]>([]);
  const [roundsOnDisplay, setRoundsOnDisplay] = useState<Round[]>([]);
  const [currentRoundStatus, setCurrentRoundStatus] = useState<number>(RoundStatus.AllRounds);
  const [input, setInput] = useState<string>('');
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [failedLoadingCommunity, setFailedLoadingCommunity] = useState(false);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [failedLoadingRounds, setFailedLoadingRounds] = useState(false);
  const { t } = useTranslation();

  const [numberOfRoundsPerStatus, setNumberOfRoundsPerStatus] = useState<number[]>([]);

  // Fetch house information
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoadingCommunity(true);

        const house = await propHouse.query.getHouse(address);

        dispatch(setActiveCommunity(house));
        setLoadingCommunity(false);
      } catch (e) {
        setLoadingCommunity(false);
        setFailedLoadingCommunity(true);
      }
    };
    fetchCommunity();
  }, [address, dispatch, propHouse.query]);

  // fetch rounds
  useEffect(() => {
    if (!community) return;

    const fetchRounds = async () => {
      try {
        setLoadingRounds(true);
        const rounds = await propHouse.query.getRoundsForHouse(community.address);
        setRounds(rounds);

        const numActiveRounds = rounds.filter(({ state }) => 
          state === RoundState.IN_PROPOSING_PERIOD || state === RoundState.IN_VOTING_PERIOD,
        ).length;

        // Number of rounds under a certain status type in a House
        setNumberOfRoundsPerStatus([
          // number of active rounds (proposing & voting)
          numActiveRounds,
          rounds.length,
        ]);

        // If there are no active rounds, default filter by all rounds
        !numActiveRounds && setCurrentRoundStatus(RoundStatus.AllRounds);

        setLoadingRounds(false);
      } catch (e) {
        setLoadingRounds(false);
        setFailedLoadingRounds(true);
      }
    };
    fetchRounds();
  }, [community, propHouse.query, propHouse.round, propHouse.round.timedFunding]);

  useEffect(() => {
    rounds &&
      // check if searching via input
      (input.length === 0
        ? // if a filter has been clicked that isn't "All rounds" (default)
          currentRoundStatus !== RoundStatus.Active
          ? // filter by all rounds
            setRoundsOnDisplay(rounds)
          : // filter by active rounds (proposing & voting)
            setRoundsOnDisplay(
              rounds.filter(({ state }) => state === RoundState.IN_PROPOSING_PERIOD || state === RoundState.IN_VOTING_PERIOD),
            )
        : // filter by search input that matches round title or description
          setRoundsOnDisplay(
            rounds.filter(round => {
              const query = input.toLowerCase();
              return (
                round.title.toLowerCase().indexOf(query) >= 0 ||
                round.description?.toLowerCase().indexOf(query) >= 0
              );
            }),
          ));
  }, [input, currentRoundStatus, rounds, propHouse.round.timedFunding, propHouse.round]);

  return (
    <>
      {community && (
        <OpenGraphElements
          title={`${community.name} Prop House`}
          description={markdownComponentToPlainText(
            <ReactMarkdown children={community.description?.toString() ?? ''} />,
          )}
          imageUrl={cardServiceUrl(CardType.house, community.address).href}
        />
      )}

      {loadingCommunity ? (
        <LoadingIndicator height={isMobile() ? 288 : 349} />
      ) : !loadingCommunity && failedLoadingCommunity ? (
        <NotFound />
      ) : (
        community && (
          <>
            <Container>
              <HouseHeader community={community} />
            </Container>

            <div className={classes.stickyContainer}>
              <Container>
                <HouseUtilityBar
                  numberOfRoundsPerStatus={numberOfRoundsPerStatus}
                  currentRoundStatus={currentRoundStatus}
                  setCurrentRoundStatus={setCurrentRoundStatus}
                  input={input}
                  setInput={setInput}
                />
              </Container>
            </div>

            <div className={classes.houseContainer}>
              <Container>
                <Row>
                  {loadingRounds ? (
                    <LoadingIndicator />
                  ) : !loadingRounds && failedLoadingRounds ? (
                    <ErrorMessageCard message={t('noRoundsAvailable')} />
                  ) : roundsOnDisplay.length > 0 ? (
                    // TODO: Fix type
                    sortRoundByState(roundsOnDisplay).map((round, index) => (
                      <Col key={index} xl={6}>
                        <RoundCard round={round} />
                      </Col>
                    ))
                  ) : input === '' ? (
                    <Col>
                      <ErrorMessageCard message={t('noRoundsAvailable')} />
                    </Col>
                  ) : (
                    <NoSearchResults />
                  )}
                </Row>
              </Container>
            </div>
          </>
        )
      )}
    </>
  );
};

export default House;
