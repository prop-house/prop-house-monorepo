import classes from './House.module.css';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import HouseHeader from '../../HouseHeader';
import { useEffect, useRef, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { setActiveCommunity, setActiveProposals } from '../../../state/slices/propHouse';

import { slugToName } from '../../../utils/communitySlugs';
import { Col, Container, Row } from 'react-bootstrap';
import RoundCard from '../../RoundCard';
import HouseUtilityBar from '../../HouseUtilityBar';
import { AuctionStatus, auctionStatus } from '../../../utils/auctionStatus';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import LoadingIndicator from '../../LoadingIndicator';
import RoundMessage from '../../RoundMessage';
import NoSearchResults from '../../NoSearchResults';
import NotFound from '../../NotFound';
import { sortRoundByStatus } from '../../../utils/sortRoundByStatus';
import { RoundStatus } from '../../StatusFilters';

const House = () => {
  const location = useLocation();
  const slug = location.pathname.substring(1, location.pathname.length);

  const isValidAddress = slug && ethers.utils.isAddress(slug);
  const dispatch = useAppDispatch();
  const { library } = useEthers();
  const cleanedUp = useRef(false);
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [rounds, setRounds] = useState<StoredAuction[]>();
  const [currentRoundStatus, setCurrentRoundStatus] = useState<number>(RoundStatus.Active);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const [numberOfRoundsPerStatus, setNumberOfRoundsPerStatus] = useState<number[]>([]);

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch community
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setIsLoading(true);
        // fetch by address or name
        const community = isValidAddress
          ? await client.current.getCommunity(slug)
          : await client.current.getCommunityWithName(slugToName(slug));

        // Number of rounds under a certain status type in a House
        setNumberOfRoundsPerStatus([
          // number of active rounds (proposing & voting)
          community.auctions.filter(
            r =>
              auctionStatus(r) === AuctionStatus.AuctionAcceptingProps ||
              auctionStatus(r) === AuctionStatus.AuctionVoting,
          ).length,

          // total number of rounds
          community.auctions.length,
        ]);

        // if there are no active rounds, default filter by all rounds
        community.auctions.filter(
          r =>
            auctionStatus(r) === AuctionStatus.AuctionAcceptingProps ||
            auctionStatus(r) === AuctionStatus.AuctionVoting,
        ).length === 0 && setCurrentRoundStatus(RoundStatus.AllRounds);

        // sort rounds
        setRounds(community.auctions.sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1)));

        setIsLoading(false);

        if (cleanedUp.current) return; // assures late async call doesn't set state on unmounted comp
        dispatch(setActiveCommunity(community));
      } catch (e) {
        setIsLoading(false);
        console.log(e);
      }
    };
    fetchCommunity();
    return () => {
      cleanedUp.current = true;
      dispatch(setActiveCommunity());
      dispatch(setActiveProposals([]));
    };
  }, [slug, dispatch, isValidAddress]);

  useEffect(() => {
    community &&
      // check if searching via input
      (input.length === 0
        ? // if a filter has been clicked that isn't "All rounds" (default)
          currentRoundStatus > 0
          ? // filter by all rounds
            setRounds(community.auctions)
          : // filter by active rounds (proposing & voting)
            setRounds(
              community.auctions.filter(
                r =>
                  auctionStatus(r) === AuctionStatus.AuctionAcceptingProps ||
                  auctionStatus(r) === AuctionStatus.AuctionVoting,
              ),
            )
        : // filter by search input that matches round title or description
          setRounds(
            community.auctions.filter(round => {
              const query = input.toLowerCase();

              return (
                round.title.toLowerCase().indexOf(query) >= 0 ||
                round.description?.toLowerCase().indexOf(query) >= 0
              );
            }),
          ));
  }, [community, input, currentRoundStatus]);

  return (
    <>
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
                {community ? (
                  rounds && rounds.length > 0 ? (
                    sortRoundByStatus(rounds).map((round, index) => (
                      <Col key={index} xl={6}>
                        <RoundCard round={round} />
                      </Col>
                    ))
                  ) : input === '' ? (
                    <Col>
                      <RoundMessage message="No rounds available" />
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
