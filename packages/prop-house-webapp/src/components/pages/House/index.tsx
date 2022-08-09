import classes from './House.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import HouseHeader from '../../HouseHeader';
import { useEffect, useRef, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import {
  setActiveAuction,
  setActiveCommunity,
  setActiveProposals,
} from '../../../state/slices/propHouse';
import { getName } from 'prop-house-communities';
import FullAuction from '../../FullAuction';
import dayjs from 'dayjs';
import CTA from '../../CTA';
import { addressFormLink } from '../../../utils/addressFormLink';
import { slugToName } from '../../../utils/communitySlugs';
import LoadingIndicator from '../../LoadingIndicator';
import NotFound from '../../NotFound';
import { useTranslation } from 'react-i18next';
import { Col, Container, Row } from 'react-bootstrap';
import HouseCard from '../../HouseCard';
import { cardStatus } from '../../../utils/cardStatus';
import HouseUtilityBar from '../../HouseUtilityBar';
import { AuctionStatus, auctionStatus } from '../../../utils/auctionStatus';

const House = () => {
  const location = useLocation();
  const slug = location.pathname.substring(1, location.pathname.length);

  const isValidAddress = slug && ethers.utils.isAddress(slug);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { library } = useEthers();
  const [inactiveCommName, setInactiveCommName] = useState<string>();
  const [failedFetch, setFailedFetch] = useState(false);
  const cleanedUp = useRef(false);
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const activeAuction = useAppSelector(state => state.propHouse.activeAuction);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const { t } = useTranslation();

  const delegatedVotes = useAppSelector(state => state.propHouse.delegatedVotes);

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
        dispatch(setActiveAuction(community.auctions[0]));
      } catch (e) {
        setFailedFetch(true);
      }
    };
    fetchCommunity();
    return () => {
      cleanedUp.current = true;
      dispatch(setActiveCommunity());
      dispatch(setActiveAuction());
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

  // const handleAuctionChange = (next: boolean) => {
  //   if (!activeAuction || !community || community.auctions.length === 0) return;

  //   const auctions = community.auctions;
  //   const index = community.auctions.findIndex(a => a.id === activeAuction.id);

  //   const updatedIndex = next
  //     ? auctions[index + 1]
  //       ? index + 1
  //       : index
  //     : auctions[index - 1]
  //     ? index - 1
  //     : index;

  //   dispatch(setActiveAuction(auctions[updatedIndex]));
  // };

  // const isFirstOrLastAuction = (): [boolean, boolean] => {
  //   if (!activeAuction || !community || community.auctions.length === 0) return [false, false];
  //   const index = community.auctions.findIndex(a => a.id === activeAuction.id);
  //   return index === 0 && community.auctions.length === 1
  //     ? [true, true]
  //     : index === 0
  //     ? [true, false]
  //     : index === community.auctions.length - 1
  //     ? [false, true]
  //     : [false, false];
  // };

  if (!community && !failedFetch) return <LoadingIndicator />;
  if (!isValidAddress && failedFetch) return <NotFound />;

  // const mediaTypes = community?.auctions
  //   .map(auction => auctionStatus(auction)) // get all media types
  //   .filter((mediaType, index, array) => array.indexOf(mediaType) === index); // filter out duplicates

  // community?.auctions.filter(a=>auctionStatus(c)===)

  // community.filter(a=>)

  // let numOfRoundStatuses = [];
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

  let count = [totalCount, votingCount, proposingCount, endedCount];

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
        {count && <HouseUtilityBar roundCount={count} />}
      </Container>

      <div className={classes.houseContainer}>
        <Container>
          <Row>
            {community &&
              community.auctions.map((round, index) => {
                return (
                  <Col key={index} xl={6}>
                    <HouseCard
                      round={round}
                      // cardStatus={cardStatus(delegatedVotes ? delegatedVotes > 0 : false, round)}
                    />
                  </Col>
                );
              })}
          </Row>
        </Container>
      </div>
    </>
  );
};

export default House;
