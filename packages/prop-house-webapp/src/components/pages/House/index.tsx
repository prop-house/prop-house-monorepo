import classes from './House.module.css';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import HouseHeader from '../../HouseHeader';
import { useEffect, useRef, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { setActiveCommunity, setActiveProposals } from '../../../state/slices/propHouse';
import { getName } from 'prop-house-communities';
import dayjs from 'dayjs';
import { slugToName } from '../../../utils/communitySlugs';
import { Col, Container, Row } from 'react-bootstrap';
import HouseCard from '../../HouseCard';
import HouseUtilityBar from '../../HouseUtilityBar';
import { AuctionStatus, auctionStatus } from '../../../utils/auctionStatus';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import NoSearchResults from '../../NoSearchResults';

const House = () => {
  const location = useLocation();
  const slug = location.pathname.substring(1, location.pathname.length);

  const isValidAddress = slug && ethers.utils.isAddress(slug);
  const dispatch = useAppDispatch();
  const { library } = useEthers();
  const [inactiveCommName, setInactiveCommName] = useState<string>();
  const cleanedUp = useRef(false);
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [rounds, setRounds] = useState<StoredAuction[]>();
  const [roundStatus, setRoundStatus] = useState<number>(0);
  const [input, setInput] = useState<string>('');

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch community
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        // fetch by address or name
        const community = isValidAddress
          ? await client.current.getCommunity(slug)
          : await client.current.getCommunityWithName(slugToName(slug));

        community.auctions.sort((a, b) => (dayjs(a.createdDate) < dayjs(b.createdDate) ? 1 : -1));

        if (cleanedUp.current) return; // assures late async call doesn't set state on unmounted comp
        dispatch(setActiveCommunity(community));
      } catch (e) {
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

  // fetch inactive commmunity
  useEffect(() => {
    if (!library || community || !slug) return;

    const fetchName = async () => {
      try {
        setInactiveCommName(await getName(slug, library));
      } catch (e) {
        console.log(e);
      }
    };

    fetchName();
  }, [library, community, slug, inactiveCommName]);

  let proposingCount = 0;
  let votingCount = 0;
  let endedCount = 0;

  community &&
    community.auctions.map(a => {
      let status = auctionStatus(a);

      if (status === AuctionStatus.AuctionAcceptingProps) {
        return proposingCount++;
      } else if (status === AuctionStatus.AuctionVoting) {
        return votingCount++;
      } else if (status === AuctionStatus.AuctionEnded) {
        return endedCount++;
      }
      return status;
    });

  let totalCount = community && community.auctions.length;

  let count = [totalCount, proposingCount, votingCount, endedCount];

  useEffect(() => {
    community &&
      (input.length === 0
        ? roundStatus && roundStatus > 0
          ? setRounds(community.auctions.filter(round => auctionStatus(round) === roundStatus))
          : setRounds(community?.auctions)
        : setRounds(
            community.auctions.filter(round => {
              const query = input.toLowerCase();

              return (
                round.title.toLowerCase().indexOf(query) >= 0 ||
                round.description.toLowerCase().indexOf(query) >= 0
              );
            }),
          ));
  }, [community, input, roundStatus]);

  return (
    <>
      <Container>
        <HouseHeader
          community={community}
          inactiveComm={{
            name: inactiveCommName ? inactiveCommName : 'N/A',
            contractAddress: slug,
          }}
        />
      </Container>

      {count && (
        <div className={classes.stickyContainer}>
          <Container>
            <HouseUtilityBar
              roundCount={count}
              roundStatus={roundStatus}
              setRoundStatus={setRoundStatus}
              input={input}
              setInput={setInput}
            />
          </Container>
        </div>
      )}

      <div className={classes.houseContainer}>
        <Container>
          <Row>
            {rounds && rounds.length > 0 ? (
              rounds.map((round, index) => (
                <Col key={index} xl={6}>
                  <HouseCard round={round} />
                </Col>
              ))
            ) : (
              <Col>
                <NoSearchResults />
              </Col>
            )}
          </Row>
        </Container>
      </div>
    </>
  );
};

export default House;
