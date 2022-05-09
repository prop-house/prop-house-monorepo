import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import ProfileHeader from '../../ProfileHeader';
import { useEffect, useRef } from 'react';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import {
  setActiveCommunity,
  addAuctions,
} from '../../../state/slices/propHouse';
import Auctions from '../../Auctions';

const Community = () => {
  const location = useLocation();
  const contract_address = location.pathname.substring(
    1,
    location.pathname.length
  );

  const isValidAddress =
    contract_address && ethers.utils.isAddress(contract_address);

  const dispatch = useAppDispatch();
  const { library } = useEthers();
  const community = useAppSelector((state) => state.propHouse.activeCommunity);
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch community
  useEffect(() => {
    const getchCommunity = async () => {
      const community = await client.current.getCommunity(contract_address);
      dispatch(setActiveCommunity(community));
      dispatch(addAuctions(community.auctions));
    };
    getchCommunity();
  }, [contract_address, dispatch]);

  if (!isValidAddress) return <>invalid address, please check it!</>;
  if (!community) return <>community does not have an active prop house yet!</>;

  return (
    <>
      <ProfileHeader community={community} />
      <Auctions />
    </>
  );
};

export default Community;
