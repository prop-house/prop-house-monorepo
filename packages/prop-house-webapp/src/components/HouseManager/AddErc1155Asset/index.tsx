import classes from './AddErc1155Asset.module.css';
import React, { SetStateAction, useRef, useState } from 'react';
import Group from '../Group';
import Text from '../Text';
import Tooltip from '../../Tooltip';
import InfoSymbol from '../../InfoSymbol';
import { AssetType } from '@prophouse/sdk-react';
import { EditableAsset } from '../AssetSelector';
import AwardAddress from '../AwardAddress';
import { isAddress } from 'viem';
import useAddressType from '../../../hooks/useAddressType';
import { invalidAddressChar } from '../../../utils/invalidAddressChar';

const AddErc1155Asset: React.FC<{
  asset: EditableAsset;
  setAsset: React.Dispatch<SetStateAction<EditableAsset | undefined>>;
}> = props => {
  const { asset, setAsset } = props;

  const [isTyping, setIsTyping] = useState(false);
  const [tokenIdValue, setTokenIdValue] = useState(asset.tokenId ? asset.tokenId : '');
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: contractType } = useAddressType(asset.address);

  const handleAddressChange = (value: string) => {
    if (invalidAddressChar(value)) return;
    setIsTyping(true);
    setAsset({ ...asset, address: value });
  };

  const handleAddressBlur = async () => {
    setIsTyping(false);
    const isValidAddress = isAddress(asset.address);

    if (!isValidAddress) {
      setAsset({ ...asset, state: 'error', error: 'Invalid address' });
      return;
    }
    if (asset.assetType === AssetType.ERC721 && contractType !== 'ERC721') {
      setAsset({ ...asset, state: 'error', error: `Invalid ERC721 contract` });
      return;
    }

    if (asset.assetType === AssetType.ERC1155 && contractType !== 'ERC1155') {
      setAsset({ ...asset, state: 'error', error: `Invalid ERC1155 contract` });
      return;
    }

    setAsset({ ...asset, state: 'valid' });
  };

  const handleTokenId = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    // If value is NaN or negative, set to 0
    if (isNaN(value) || value < 0) setTokenIdValue('');

    setTokenIdValue(e.target.value);
    setAsset({ ...asset, tokenId: e.target.value });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    // If value is NaN or negative, set to 0
    if (isNaN(value) || value < 0) value = 0;
    setAsset({ ...asset, amount: value.toString() });
  };

  return (
    <Group gap={16}>
      <Group row gap={6}>
        <AwardAddress
          isTyping={isTyping}
          award={asset}
          handleBlur={handleAddressBlur}
          handleSwitch={() => setAsset({ ...asset, state: 'input' })}
          handleChange={handleAddressChange}
        />
        <Group gap={6}>
          <Tooltip
            content={
              <Group row gap={4}>
                <Text type="subtitle">Token ID</Text>

                <InfoSymbol />
              </Group>
            }
            tooltipContent="Enter the ID of the NFT"
          />

          <input
            ref={inputRef}
            className={classes.tokenIdInput}
            disabled={!contractType}
            value={tokenIdValue}
            placeholder="000"
            type="number"
            onChange={e => handleTokenId(e)}
          />
        </Group>
      </Group>

      <Group gap={6} classNames={classes.fullWidth}>
        <Text type="subtitle">Amount</Text>
        <input
          className={classes.votesInput}
          defaultValue={asset.amount === '0' ? '' : asset.amount}
          type="number"
          onChange={handleAmountChange}
        />
      </Group>
    </Group>
  );
};

export default AddErc1155Asset;
