import { useState, useEffect } from 'react';
import Card from '../Card';
import { createRoundEns } from '@prop-house/sdk';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { createProposal } from '@prop-house/sdk';
import { Proposal } from '@snapshot-labs/snapshot.js/dist/sign/types';

const CreateProposal: React.FC<{
  provider: Web3Provider;
}> = (props) => {
  const { provider } = props;

  const [account, setAccount] = useState('');
  const [data, setData] = useState({
    ens: '',
    subdomain: '',
  });
  const [proposal, setProposal] = useState<Proposal>({
    space: 'test.bluepartyhat.eth', // space where the prop should live
    type: 'single-choice',
    title: 'Test Title From Local',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et.',
    discussion: '', // link to related discussion (e.g. discourse)
    choices: ['FOR'], // the choice(s) to select, should be just one (essentialy, voting FOR)
    start: 1661215536, // voting period start
    end: 1661388336, // voting period end
    snapshot: 15392445, // snapshot block (should be === across all proposals within space)
    plugins: JSON.stringify({}),
  });

  const inputHandler = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setData({ ...data, [e.currentTarget.name]: e.currentTarget.value });
  };

  const handleCreate = async () => {
    proposal && (await createProposal(provider, proposal));
  };

  return (
    <Card title="Create Proposal">
      {['space', 'title', 'body'].map((item, index) => (
        <input
          className="mb-5 rounded py-5 px-2"
          type="text"
          name={item}
          placeholder={item}
          onChange={(e) => inputHandler(e)}
          key={index}
        />
      ))}

      <button
        className="bg-blue-500 py-5 px-2 text-white rounded"
        onClick={() => handleCreate()}
      >
        CREATE PROPOSAL
      </button>
    </Card>
  );
};

export default CreateProposal;
