import { useState, useEffect } from 'react';
import Card from '../Card';
import { createRound } from '@prop-house/sdk';
import { JsonRpcSigner } from '@ethersproject/providers';
import { RoundMetadata, TokenType } from '@prop-house/sdk/dist/types';

const CreateRound: React.FC<{
  signer: JsonRpcSigner;
}> = props => {
  const { signer } = props;

  const default_token_type = TokenType.ERC721;

  const [account, setAccount] = useState('');
  const [roundEns, setRoundEns] = useState('');
  const [roundData, setRoundData] = useState<RoundMetadata>({
    name: '',
    about: '',
    avatar: '',
    votingTokenType: default_token_type,
    votingTokenContractAddress: '',
  });

  useEffect(() => {
    const fetchAccount = async () => {
      setAccount(await signer.getAddress());
    };
    fetchAccount();
  });

  const inputHandler = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.currentTarget.name === 'house-ens') {
      setRoundEns(e.currentTarget.value);
    } else {
      setRoundData({
        ...roundData,
        [e.currentTarget.name]: e.currentTarget.value,
      });
    }
  };

  const selectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setRoundData(prev => {
      return {
        ...prev,
        votingTokenType: value === 'erc721' ? TokenType.ERC721 : TokenType.ERC20,
      };
    });
  };

  const handleSubmit = async () => {
    createRound(
      signer,
      process.env.REACT_APP_INFURA_IPFS_PROJECT_ID
        ? process.env.REACT_APP_INFURA_IPFS_PROJECT_ID
        : '',
      process.env.REACT_APP_INFURA_IPFS_SECRET ? process.env.REACT_APP_INFURA_IPFS_SECRET : '',
      roundEns,
      roundData,
    );
  };

  const handleActivate = async () => {
    await fetch(`https://hub.snapshot.org/api/spaces/${roundEns}/poke`);
  };

  return (
    <Card title="Create Round">
      <input
        className="mb-5 rounded py-5 px-2"
        type="text"
        name="house-ens"
        placeholder="round ens (e.g. round5.nouns.eth)"
        onChange={e => inputHandler(e)}
      />
      <input
        className="mb-5 rounded py-5 px-2"
        type="text"
        name="name"
        placeholder="round name"
        onChange={e => inputHandler(e)}
      />
      <input
        className="mb-5 rounded py-5 px-2"
        type="text"
        name="about"
        placeholder="description"
        onChange={e => inputHandler(e)}
      />
      <input
        className="mb-5 rounded py-5 px-2"
        type="text"
        name="avatar"
        placeholder="avatar url"
        onChange={e => inputHandler(e)}
      />
      <select onChange={selectChange} className="mb-5 rounded py-5 px-2">
        <option value="erc721">ERC721</option>
        <option value="erc20">ERC20</option>
      </select>
      <input
        className="mb-5 rounded py-5 px-2"
        type="text"
        name="votingTokenContractAddress"
        placeholder="voting contract address"
        onChange={e => inputHandler(e)}
      />
      <button className="bg-blue-500 py-5 px-2 text-white rounded" onClick={() => handleSubmit()}>
        CREATE ROUND
      </button>

      <button
        className="bg-blue-500 py-5 px-2 text-white rounded mt-4"
        onClick={() => handleActivate()}
      >
        ACTIVATE
      </button>
    </Card>
  );
};

export default CreateRound;
