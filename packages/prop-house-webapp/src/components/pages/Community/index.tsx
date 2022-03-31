import { useParams } from 'react-router-dom';

const Community = () => {
  const params = useParams();
  const { contract_address } = params;

  return <>address: {contract_address}</>;
};

export default Community;
