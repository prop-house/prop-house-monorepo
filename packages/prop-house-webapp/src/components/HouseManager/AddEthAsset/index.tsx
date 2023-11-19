import classes from './AddEthAsset.module.css';
import React, { SetStateAction } from 'react';
import Group from '../Group';
import Text from '../Text';
import { EditableAsset } from '../AssetSelector';
import { parseEther, formatEther } from 'viem';

const AddEthAsset: React.FC<{
  asset: EditableAsset;
  setAsset: React.Dispatch<SetStateAction<EditableAsset | undefined>>;
}> = props => {
  const { asset, setAsset } = props;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) value = 0;
    let wei = parseEther(value.toString());
    setAsset({ ...asset, amount: wei.toString() });
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clipboardData = e.clipboardData.getData('text');

    let value = parseInt(clipboardData, 10);
    if (isNaN(value) || value < 0) {
      e.preventDefault();
      return;
    } else {
      return clipboardData;
    }
  };

  return (
    <Group gap={16}>
      <Group gap={6}>
        <Text type="subtitle">Amount</Text>
        <input
          className={classes.votesInput} // todo: rename classname to something useful
          defaultValue={asset.amount ? formatEther(BigInt(asset.amount)) : 0}
          type="number"
          onChange={handleAmountChange}
          onPaste={handleInputPaste}
        />
      </Group>
    </Group>
  );
};
export default AddEthAsset;
