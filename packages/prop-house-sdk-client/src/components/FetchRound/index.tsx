import { useState } from 'react';
import { ethers } from 'ethers';
import { useRound } from '@prop-house/hooks';
import Card from '../Card';

const FetchRound = () => {
  const [ens] = useState<string>('test.bluepartyhat.eth');

  const provider = new ethers.providers.JsonRpcProvider(
    `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  );

  const { data: round, status: roundStatus, error: roundError } = useRound(ens, provider);

  const roundResults = round && (
    <div className="bg-red-100 py-10 px-5 my-5 rounded">
      <div className="text-xl [&>*]:text-lg mb-5">Round Results:</div>
      <p>
        <span className="font-bold">Name:</span> {round.name}
      </p>
      <p>
        <span className="font-bold">Network:</span> {round.network}
      </p>
      <p>
        <span className="font-bold">Symbol:</span> {round.symbol}
      </p>
      <div>
        <span className="font-bold">Proposals</span>
        <div className="font-bold">
          {round?.proposals &&
            round.proposals.map((prop: any, idx: any) => {
              return (
                <div key={idx}>
                  <span>title: {prop.title}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  return (
    <Card title={`Fetch data for ${ens}`}>
      <div>
        {roundStatus === 'loading'
          ? 'loading...'
          : roundStatus === 'error'
          ? `Error fetching house ${roundError}\n`
          : roundResults}
      </div>
    </Card>
  );
};
export default FetchRound;
