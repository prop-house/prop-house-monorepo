import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import { isActiveCommunity } from 'prop-house-nounish-contracts';

const Community = () => {
  const location = useLocation();
  const contract_address = location.pathname.substring(
    1,
    location.pathname.length
  );

  const isValidAddress =
    contract_address && ethers.utils.isAddress(contract_address);

  if (!isValidAddress) return <>invalid address, please check it!</>;
  if (!isActiveCommunity(contract_address))
    return <>community does not have an active prop house yet!</>;

  return <>active comm</>;
};

export default Community;
