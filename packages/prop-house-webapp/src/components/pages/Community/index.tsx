import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import ProfileHeader from '../../ProfileHeader';
import { useEffect, useRef, useState } from 'react';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import {
  setActiveAuction,
  setActiveCommunity,
  setAuctions,
} from '../../../state/slices/propHouse';
import { getName } from 'prop-house-communities';
import FullAuction from '../../FullAuction';
import dayjs from 'dayjs';
import CTA from '../../CTA';
import { addressFormLink } from '../../../utils/addressFormLink';
import { slugToName } from '../../../utils/communitySlugs';
import NotFound from '../../NotFound';

const Community = () => {
  const location = useLocation();
  const slug = location.pathname.substring(1, location.pathname.length);

  const isValidAddress = slug && ethers.utils.isAddress(slug);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { library } = useEthers();
  const [inactiveCommName, setInactiveCommName] = useState<string>();
  const community = useAppSelector((state) => state.propHouse.activeCommunity);
  const activeAuction = useAppSelector(
    (state) => state.propHouse.activeAuction
  );
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

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

        community.auctions.sort((a, b) =>
          dayjs(a.createdDate) < dayjs(b.createdDate) ? 1 : -1
        );
        dispatch(setActiveCommunity(community));
        dispatch(setAuctions(community.auctions));
        dispatch(setActiveAuction(community.auctions[0]));
      } catch (e) {
        console.log(e);
      }
    };
    fetchCommunity();
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

  const handleAuctionChange = (next: boolean) => {
    if (!activeAuction || !community || community.auctions.length === 0) return;

    const auctions = community.auctions;
    const index = community.auctions.findIndex(
      (a) => a.id === activeAuction.id
    );

    const updatedIndex = next
      ? auctions[index + 1]
        ? index + 1
        : index
      : auctions[index - 1]
      ? index - 1
      : index;

    dispatch(setActiveAuction(auctions[updatedIndex]));
  };

  const isFirstOrLastAuction = (): [boolean, boolean] => {
    if (!activeAuction || !community || community.auctions.length === 0)
      return [false, false];
    const index = community.auctions.findIndex(
      (a) => a.id === activeAuction.id
    );
    return index === 0 && community.auctions.length === 1
      ? [true, true]
      : index === 0
      ? [true, false]
      : index === community.auctions.length - 1
      ? [false, true]
      : [false, false];
  };

  if (!isValidAddress && !community) return <NotFound />;

  return (
    <>
      <ProfileHeader
        community={community}
        inactiveComm={{
          name: inactiveCommName ? inactiveCommName : 'N/A',
          contractAddress: slug,
        }}
      />
      {community && activeAuction ? (
        <FullAuction
          auction={activeAuction}
          isFirstOrLastAuction={isFirstOrLastAuction}
          handleAuctionChange={handleAuctionChange}
        />
      ) : community && !activeAuction ? (
        <CTA
          title="Coming soon! "
          content={
            <>
              <span>{community.name}</span> does not yet have open Funding
              Rounds but will soon!
            </>
          }
          btnTitle="View houses"
          btnAction={() => navigate('/explore')}
        />
      ) : (
        <CTA
          title="Supercharge your Nounish community"
          content={
            <>
              <span>{community ? community.name : inactiveCommName}</span> does
              not have an active Prop House yet. Deploy capital with your own
              Prop House to build long-term value for your community.
            </>
          }
          btnAction={() => {
            window.open(addressFormLink, '_blank');
          }}
          btnTitle="Contact us"
        />
      )}
    </>
  );
};

export default Community;
