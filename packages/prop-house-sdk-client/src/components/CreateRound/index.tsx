import { useState, useEffect } from 'react';
import Card from '../Card';
import { createRound } from '@prop-house/sdk';
import { JsonRpcSigner } from '@ethersproject/providers';
import { PropHouseRoundMetadata, PropHouseStrategyType } from '@prop-house/sdk/dist/types';

const CreateRound: React.FC<{
  signer: JsonRpcSigner;
}> = props => {
  const { signer } = props;

  const DEFAULT_STRATEGY = PropHouseStrategyType.ERC721;

  const [account, setAccount] = useState('');
  const [roundEns, setRoundEns] = useState('');

  const [roundData, setRoundData] = useState<PropHouseRoundMetadata>({
    name: '',
    about: '',
    adminAddress: '',
    strategy: DEFAULT_STRATEGY,
    proposingStart: 0,
    votingStart: 0,
    votingEnd: 0,
    snapshotBlock: 0,
  });

  useEffect(() => {
    const fetchAccount = async () => {
      setAccount(await signer.getAddress());
    };
    fetchAccount();
  });

  const inputHandler = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();

    const key = e.currentTarget.name;
    const value = e.currentTarget.value;

    if (key === 'ens') {
      setRoundEns(value);
      return;
    }

    if (key === 'custom') {
      // set 'custom' input as strategy
      setRoundData((prev: any) => {
        return {
          ...prev,
          contractAddress: undefined,
          customStrategy: value,
        };
      });
      return;
    }

    if (key === 'erc20' || key === 'erc721') {
      setRoundData(prev => {
        return {
          ...prev,
          contractAddress: value,
          customStrategy: undefined,
        };
      });
      return;
    }

    setRoundData(prev => {
      return {
        ...prev,
        [key]: value,
      };
    });

    console.log(roundData);
  };

  const selectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    setRoundData((prev: any) => {
      return {
        ...prev,
        strategy: value,
      };
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await createRound(
        signer,
        process.env.REACT_APP_INFURA_IPFS_PROJECT_ID
          ? process.env.REACT_APP_INFURA_IPFS_PROJECT_ID
          : '',
        process.env.REACT_APP_INFURA_IPFS_SECRET ? process.env.REACT_APP_INFURA_IPFS_SECRET : '',
        roundEns,
        roundData,
      );
      console.log(res);
    } catch (e) {
      console.log(e);
    }
  };

  const handleActivate = async () => {
    await fetch(`https://hub.snapshot.org/api/spaces/${roundEns}/poke`);
  };

  return (
    <Card title="Create Round">
      <input
        className="mb-5 rounded py-5 px-2"
        type="text"
        name="ens"
        placeholder="ens (e.g. round5.nouns.eth)"
        onChange={e => inputHandler(e)}
      />

      {Object.keys(roundData).map(key => {
        if (key === 'strategy')
          return (
            <>
              <select onChange={selectChange} className="mb-5 rounded py-5 px-2">
                <option value="erc721">ERC721</option>
                <option value="erc20">ERC20</option>
                <option value="custom">Custom</option>
              </select>
              {roundData.strategy && (
                <input
                  className="mb-5 rounded py-5 px-2"
                  type="text"
                  name={roundData.strategy}
                  placeholder={roundData.strategy === 'custom' ? '{}' : 'contractAddress'}
                  onChange={e => inputHandler(e)}
                />
              )}
            </>
          );

        if (key == 'customStrategy' || key === 'contractAddress') return;

        return (
          <input
            className="mb-5 rounded py-5 px-2"
            type="text"
            name={key}
            placeholder={key}
            onChange={e => inputHandler(e)}
          />
        );
      })}

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
