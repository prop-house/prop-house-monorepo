import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { isActiveCommunity } from 'prop-house-communities';
import FullAuction from '../../FullAuction';
import { useAppSelector } from '../../../hooks';
import { findAuctionById } from '../../../utils/findAuctionById';
import ProfileHeader from '../../ProfileHeader';

const Community = () => {
  const location = useLocation();
  const contract_address = location.pathname.substring(
    1,
    location.pathname.length
  );

  const isValidAddress =
    contract_address && ethers.utils.isAddress(contract_address);

  const auction = useAppSelector((state) =>
    findAuctionById(11, state.propHouse.auctions)
  );

  if (!isValidAddress) return <>invalid address, please check it!</>;
  if (!isActiveCommunity(contract_address))
    return <>community does not have an active prop house yet!</>;

  return (
    <>
      <ProfileHeader contractAddress={contract_address} />
      {auction && <FullAuction auction={auction} />}
    </>
  );
};

export default Community;
