import { useState } from 'react';
import { ethers } from 'ethers';
import { useHouse } from '@prop-house/hooks';
import Card from '../Card';

const FetchHouse = () => {
  const [ens] = useState<string>('bluepartyhat.eth');

  const provider = new ethers.providers.JsonRpcProvider(
    `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`
  );

  const { data: house, status, error } = useHouse(ens, provider);

  const results = house && (
    <>
      <p>
        <span className="font-bold">Name:</span> {house.name}
      </p>
      <p>
        <span className="font-bold">Description:</span> {house.description}
      </p>
      <p>
        <span className="font-bold">Avatar URL:</span> {house.profileImgURL}
      </p>
      <p>
        <span className="font-bold">Round names:</span>{' '}
        {house.rounds.map((roundName) => `${roundName}, `)}
      </p>
    </>
  );

  return (
    <Card title={`Fetch data for ${ens}`}>
      <div>
        {status === 'loading'
          ? 'loading...'
          : status === 'error'
          ? `Error fetching house ${error}\n`
          : results}
      </div>
    </Card>
  );
};
export default FetchHouse;
