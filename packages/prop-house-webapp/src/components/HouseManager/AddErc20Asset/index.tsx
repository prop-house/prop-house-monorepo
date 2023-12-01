import classes from './AddErc20Asset.module.css';
import React, { SetStateAction, useEffect, useState } from 'react';
import Group from '../Group';
import Text from '../Text';
import { AssetType } from '@prophouse/sdk-react';
import { DefaultERC20s, EditableAsset, erc20TokenAddresses } from '../AssetSelector';
import AwardAddress from '../AwardAddress';
import ERC20Buttons from '../ERC20Buttons';
import { useSingleAssetDecimals } from '../../../hooks/useAssetsWithDecimals';
import { parseUnits, formatUnits, isAddress } from 'viem';
import useAddressType from '../../../hooks/useAddressType';
import { invalidAddressChar } from '../../../utils/invalidAddressChar';

const AddErc20Asset: React.FC<{
  asset: EditableAsset;
  setAsset: React.Dispatch<SetStateAction<EditableAsset | undefined>>;
}> = props => {
  const { asset, setAsset } = props;

  const [isTyping, setIsTyping] = useState(false);
  const [value, setValue] = useState(''); // used to store the value input by user to update asset.amount once decimals are fetched
  const [formattedValue, setFormattedValue] = useState('');
  const { data: contractType } = useAddressType(asset.address);

  const s =
    asset.address === erc20TokenAddresses[DefaultERC20s.USDC]
      ? DefaultERC20s.USDC
      : asset.address === erc20TokenAddresses[DefaultERC20s.APE]
      ? DefaultERC20s.APE
      : isAddress(asset.address)
      ? DefaultERC20s.OTHER
      : undefined;

  const [selectedErc20, setSelectedErc20] = useState(s);

  const decimals = useSingleAssetDecimals(asset);

  // set asset.amount to the correct units when decimals are ready
  useEffect(() => {
    if (!decimals || !value) return;

    const units = parseUnits(value, decimals);
    if (units.toString() !== asset.amount) setAsset({ ...asset, amount: units.toString() });
  }, [decimals, asset, value, setAsset]);

  // updated value displayed in the input on asset.amount change
  useEffect(() => {
    if (!asset.amount || !decimals) return;
    setFormattedValue(formatUnits(BigInt(asset.amount), decimals));
  }, [asset.amount, decimals]);

  const handleSelectErc20Asset = async (token: DefaultERC20s) => {
    let updated: Partial<EditableAsset>;

    // when selecting a new asset, reset the state
    token === DefaultERC20s.OTHER
      ? (updated = {
          address: '',
          state: 'input',
          amount: '0',
          assetType: AssetType.ERC20,
        })
      : (updated = {
          address: erc20TokenAddresses[token],
          amount: '0',
          assetType: AssetType.ERC20,
        });

    setSelectedErc20(token);
    setAsset({ ...asset, ...updated });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);
    // If value is NaN or negative, set to 0
    if (isNaN(value) || value < 0) value = 0;
    setValue(value.toString());
  };

  const handleAddressChange = (value: string) => {
    if (invalidAddressChar(value)) return;
    setIsTyping(true);
    setAsset({ ...asset, address: value });
  };

  const handleERC20AddressBlur = async () => {
    const isValidAddress = isAddress(asset.address);

    setIsTyping(false);
    if (!isValidAddress) {
      setAsset({ ...asset, state: 'error', error: 'Invalid address' });
      return;
    }

    if (!contractType || contractType !== 'ERC20') {
      setAsset({ ...asset, state: 'error', error: 'Invalid ERC20 contract' });
      return;
    }

    setAsset({ ...asset, state: 'valid' });
  };

  return (
    <Group gap={16}>
      <Group gap={6}>
        <ERC20Buttons asset={asset} handleSelectAward={handleSelectErc20Asset} />
      </Group>

      {/* the custom address input */}
      {selectedErc20 === DefaultERC20s.OTHER && (
        <Group gap={6}>
          <AwardAddress
            award={asset}
            isTyping={isTyping}
            handleBlur={handleERC20AddressBlur}
            handleSwitch={() => setAsset({ ...asset, state: 'input' })}
            handleChange={handleAddressChange}
          />
        </Group>
      )}

      <Group gap={6} classNames={classes.fullWidth}>
        <Text type="subtitle">Amount</Text>
        <input
          className={classes.votesInput}
          defaultValue={formattedValue === '0' ? '' : formattedValue}
          type="number"
          onChange={handleAmountChange}
        />
      </Group>
    </Group>
  );
};
export default AddErc20Asset;
