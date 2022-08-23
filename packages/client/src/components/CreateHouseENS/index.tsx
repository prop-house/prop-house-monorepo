import Card from '../Card';
import { useEffect, useState } from 'react';
import { createHouseEns } from '@prop-house/sdk';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Signer } from 'ethers';

const CreateHouseENS: React.FC<{
  signer: Signer;
}> = (props) => {
  const { signer } = props;

  const [account, setAccount] = useState('undefined salt');
  const [ens, setEns] = useState('');

  useEffect(() => {
    const fetchAccount = async () => {
      setAccount(await signer.getAddress());
    };
    fetchAccount();
  });

  const register = async () => {
    if (!account) return;
    await createHouseEns(ens, account, signer);
  };

  const handler = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setEns(e.currentTarget.value);
  };
  return (
    <Card title="Create House ENS">
      <input
        className="mb-5 rounded py-5 px-2"
        type="text"
        placeholder={'ens domain'}
        onChange={(e) => handler(e)}
      />
      <button
        className="bg-blue-500 py-5 px-2 text-white rounded"
        onClick={() => register()}
      >
        REGISTER ENS
      </button>
    </Card>
  );
};

export default CreateHouseENS;
