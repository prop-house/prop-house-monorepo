import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { isActiveCommunity } from 'prop-house-nounish-contracts';

const Community = () => {
  const params = useParams();
  const { contract_address } = params;

  const isValidAddress =
    contract_address && ethers.utils.isAddress(contract_address);

  if (!isValidAddress) return <>invalid address</>;
  if (!isActiveCommunity(contract_address))
    return <>community does not have prop house yet!</>;

  return <></>;
};

export default Community;
