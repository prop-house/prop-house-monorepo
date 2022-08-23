import { useState } from 'react';
import Card from '../Card';
import { Web3Provider } from '@ethersproject/providers';
import { createProposal } from '@prop-house/sdk';
import { ProposalUserInput } from '@prop-house/sdk/dist/types/Proposal';

const CreateProposal: React.FC<{
  provider: Web3Provider;
}> = props => {
  const { provider } = props;

  const [proposal, setProposal] = useState<ProposalUserInput>({
    space: '',
    title: '',
    body: '',
  });

  const inputHandler = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setProposal({ ...proposal, [e.currentTarget.name]: e.currentTarget.value });
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
          onChange={e => inputHandler(e)}
          key={index}
        />
      ))}

      <button className="bg-blue-500 py-5 px-2 text-white rounded" onClick={() => handleCreate()}>
        CREATE PROPOSAL
      </button>
    </Card>
  );
};

export default CreateProposal;
