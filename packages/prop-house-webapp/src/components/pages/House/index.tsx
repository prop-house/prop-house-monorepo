import classes from './House.module.css';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import HouseHeader from '../../HouseHeader';
import React, { useEffect, useRef, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { setActiveCommunity } from '../../../state/slices/propHouse';

import { slugToName } from '../../../utils/communitySlugs';
import { Col, Container, Row } from 'react-bootstrap';
import RoundCard from '../../RoundCard';
import HouseUtilityBar from '../../HouseUtilityBar';
import { AuctionStatus, auctionStatus } from '../../../utils/auctionStatus';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import LoadingIndicator from '../../LoadingIndicator';
import ErrorMessageCard from '../../ErrorMessageCard';
import NoSearchResults from '../../NoSearchResults';
import NotFound from '../../NotFound';
import { sortRoundByStatus } from '../../../utils/sortRoundByStatus';
import { RoundStatus } from '../../StatusFilters';
import OpenGraphElements from '../../OpenGraphElements';
import { cardServiceUrl, CardType } from '../../../utils/cardServiceUrl';
import ReactMarkdown from 'react-markdown';
import { markdownComponentToPlainText } from '../../../utils/markdownToPlainText';

const House = () => {
  const location = useLocation();
  const slug = location.pathname.substring(1, location.pathname.length);

  const { library } = useEthers();
  const dispatch = useAppDispatch();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [rounds, setRounds] = useState<StoredAuction[]>([]);
  const [roundsOnDisplay, setRoundsOnDisplay] = useState<StoredAuction[]>([]);
  const [currentRoundStatus, setCurrentRoundStatus] = useState<number>(RoundStatus.AllRounds);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const [numberOfRoundsPerStatus, setNumberOfRoundsPerStatus] = useState<number[]>([]);

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch community
  useEffect(() => {
    const fetchCommunity = async () => {
      setIsLoading(true);
      const community = await client.current.getCommunityWithName(slugToName(slug));
      dispatch(setActiveCommunity(community));
      setIsLoading(false);
    };
    fetchCommunity();
  }, [slug, dispatch]);

  // fetch rounds
  useEffect(() => {
    if (!community) return;

    const fetchRounds = async () => {
      const rounds = await client.current.getAuctionsForCommunity(community.id);
      setRounds(rounds);

      // Number of rounds under a certain status type in a House
      setNumberOfRoundsPerStatus([
        // number of active rounds (proposing & voting)
        rounds.filter(
          r =>
            auctionStatus(r) === AuctionStatus.AuctionAcceptingProps ||
            auctionStatus(r) === AuctionStatus.AuctionVoting,
        ).length,
        rounds.length,
      ]);

      // if there are no active rounds, default filter by all rounds
      rounds.filter(
        r =>
          auctionStatus(r) === AuctionStatus.AuctionAcceptingProps ||
          auctionStatus(r) === AuctionStatus.AuctionVoting,
      ).length === 0 && setCurrentRoundStatus(RoundStatus.AllRounds);
    };
    fetchRounds();
  }, [community]);

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
                  auctionStatus(r) === AuctionStatus.AuctionAcceptingProps ||
                  auctionStatus(r) === AuctionStatus.AuctionVoting,
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
      {community && (
        <OpenGraphElements
          title={`${community.name} Prop House`}
          description={markdownComponentToPlainText(
            <ReactMarkdown children={community.description.toString()} />,
          )}
          imageUrl={cardServiceUrl(CardType.house, community.id).href}
        />
      )}

      {isLoading ? (
        <LoadingIndicator />
      ) : !community ? (
        <NotFound />
      ) : (
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
                {roundsOnDisplay ? (
                  roundsOnDisplay.length > 0 ? (
                    sortRoundByStatus(roundsOnDisplay).map((round, index) => (
                      <Col key={index} xl={6}>
                        <RoundCard round={round} />
                      </Col>
                    ))
                  ) : input === '' ? (
                    <Col>
                      <ErrorMessageCard message="No rounds available" />
                    </Col>
                  ) : (
                    <NoSearchResults />
                  )
                ) : (
                  <LoadingIndicator />
                )}
              </Row>
            </Container>
          </div>
        </>
      )}
    </>
  );
};

export default House;
