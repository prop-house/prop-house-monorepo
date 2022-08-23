import Card from '../Card';
import { createHouseMetadata } from '@prop-house/sdk';
import { useState } from 'react';
import { Signer } from 'ethers';

const CreateHouseMetadata: React.FC<{ signer: Signer; ens: string }> = (
  props
) => {
  const { signer, ens } = props;

  const [metadata, setMetadata] = useState({
    name: '',
    description: '',
    profileImgURL: '',
  });

  const inputHandler = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setMetadata({
      ...metadata,
      [e.currentTarget.name]: e.currentTarget.value,
    });
  };

  const uploadMetadata = () => {
    createHouseMetadata(
      signer,
      process.env.REACT_APP_INFURA_IPFS_PROJECT_ID
        ? process.env.REACT_APP_INFURA_IPFS_PROJECT_ID
        : '',
      process.env.REACT_APP_INFURA_IPFS_SECRET
        ? process.env.REACT_APP_INFURA_IPFS_SECRET
        : '',
      ens,
      metadata
    );
  };

  return (
    <Card title="Create House metadata">
      {['name', 'description', 'profileImgURL'].map((item, index) => (
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
        onClick={() => uploadMetadata()}
      >
        WRITE METADATA
      </button>
    </Card>
  );
};

export default CreateHouseMetadata;
