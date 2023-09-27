import classes from './HousePage.module.css';
import { useAppSelector } from '../../hooks';
import HouseHeader from '../../components/HouseHeader';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import HouseUtilityBar from '../../components/HouseUtilityBar';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessageCard from '../../components/ErrorMessageCard';
import NoSearchResults from '../../components/NoSearchResults';
import { sortRoundByStatus } from '../../utils/sortRoundByStatus';
import { RoundStatus } from '../../components/StatusFilters';
import { useTranslation } from 'react-i18next';
import { Round, RoundState, usePropHouse } from '@prophouse/sdk-react';
import RoundCard_ from '../../components/_RoundCard';

const HousePage: React.FC<{}> = () => {
  const propHouse = usePropHouse();

  const house = useAppSelector(state => state.propHouse.onchainActiveHouse);
  const [rounds, setRounds] = useState<Round[]>();
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [failedLoadingRounds, setFailedLoadingRounds] = useState(false);
  const [roundsOnDisplay, setRoundsOnDisplay] = useState<Round[]>([]);
  const [currentRoundStatus, setCurrentRoundStatus] = useState<number>(RoundStatus.AllRounds);
  const [input, setInput] = useState<string>('');

  const { t } = useTranslation();

  const [numberOfRoundsPerStatus, setNumberOfRoundsPerStatus] = useState<number[]>([]);

  // fetch rounds
  useEffect(() => {
    if (!house || rounds) return;

    const fetchRounds = async () => {
      setLoadingRounds(true);
      try {
        const rounds = await propHouse.query.getRoundsForHouse(house.address);
        setRounds(rounds);

        // Number of rounds under a certain status type in a House
        setNumberOfRoundsPerStatus([
          // number of active rounds (proposing & voting)
          rounds.filter(
            r =>
              r.state === RoundState.IN_PROPOSING_PERIOD || r.state === RoundState.IN_VOTING_PERIOD,
          ).length,
          rounds.length,
        ]);

        // if there are no active rounds, default filter by all rounds
        rounds.filter(
          r =>
            r.state === RoundState.IN_PROPOSING_PERIOD || r.state === RoundState.IN_VOTING_PERIOD,
        ).length === 0 && setCurrentRoundStatus(RoundStatus.AllRounds);

        setLoadingRounds(false);
      } catch (e) {
        setLoadingRounds(false);
        setFailedLoadingRounds(true);
      }
    };
    fetchRounds();
  }, []);

  // search functionality
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
              rounds.filter(
                r =>
                  r.state === RoundState.IN_PROPOSING_PERIOD ||
                  r.state === RoundState.IN_VOTING_PERIOD,
              ),
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
  }, [input, currentRoundStatus, rounds]);

  return (
    <>
      {/* {community && (todo: handle 
        <OpenGraphElements
          title={`${community.name} Prop House`}
          description={markdownComponentToPlainText(
            <ReactMarkdown children={community.description.toString()} />,
          )}
          imageUrl={cardServiceUrl(CardType.house, community.id).href}
        />
      )} */}

      {house && (
        <>
          <Container>
            <HouseHeader house={house} />
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
                  sortRoundByStatus(roundsOnDisplay).map((round, index) => (
                    <Col key={index} xl={6}>
                      <RoundCard_ round={round} house={house} />
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
      )}
    </>
  );
};

export default HousePage;
