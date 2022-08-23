import { useState, useEffect } from 'react';
import Card from '../Card';
import { createRoundEns } from '@prop-house/sdk';
import { JsonRpcSigner } from '@ethersproject/providers';

const CreateRoundEns: React.FC<{
  signer: JsonRpcSigner;
}> = (props) => {
  const { signer } = props;

  const [account, setAccount] = useState('');
  const [data, setData] = useState({
    ens: '',
    subdomain: '',
  });

  useEffect(() => {
    const fetchAccount = async () => {
      setAccount(await signer.getAddress());
    };
    fetchAccount();
  });

  const inputHandler = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setData({ ...data, [e.currentTarget.name]: e.currentTarget.value });
  };

  const registerSubdomain = async () => {
    const tx = await createRoundEns(data.ens, data.subdomain, account, signer);
  };
  return (
    <Card title="Create Round ENS">
      <input
        className="mb-5 rounded py-5 px-2"
        type="text"
        name="ens"
        placeholder="house ens (e.g. nouns.eth)"
        onChange={(e) => inputHandler(e)}
      />
      <input
        className="mb-5 rounded py-5 px-2"
        type="text"
        name="subdomain"
        placeholder="subdomain"
        onChange={(e) => inputHandler(e)}
      />
      <button
        className="bg-blue-500 py-5 px-2 text-white rounded"
        onClick={() => registerSubdomain()}
      >
        REGISTER SUBDOMAIN
      </button>
    </Card>
  );
};

export default CreateRoundEns;
