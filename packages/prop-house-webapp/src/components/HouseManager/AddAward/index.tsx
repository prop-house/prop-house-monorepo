import classes from './AddAward.module.css';
import React, { useRef, useState } from 'react';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import Group from '../Group';
import { ERC20 } from '../AwardsConfig';
import ViewOnOpenSeaButton from '../ViewOnOpenSeaButton';
import Text from '../Text';
import Tooltip from '../../Tooltip';
import InfoSymbol from '../../InfoSymbol';
import { AssetType } from '@prophouse/sdk-react';
import { getTokenInfo } from '../../../utils/getTokenInfo';
import useAddressType from '../../../utils/useAddressType';
import { Award, NewAward, erc20Name, erc20TokenAddresses } from '../AssetSelector';
import AwardAddress from '../AwardAddress';
import ViewOnEtherscanButton from '../ViewOnEtherscanButton';
import ERC20Buttons from '../ERC20Buttons';
import { useEthersProvider } from '../../../hooks/useEthersProvider';
import { getUSDPrice } from '../../../utils/getUSDPrice';
import { getTokenIdImage } from '../../../utils/getTokenIdImage';
import { assetTypeString } from '../../../utils/assetTypeToString';

const AddAward: React.FC<{
  award: Award;
  setAward: (award: Award) => void;
}> = props => {
  const { award, setAward } = props;

  const verifiedAddress = award.state === 'success';
  const [selectedAwardType, setSelectedAwardType] = useState<AssetType>(AssetType.ETH);
  const [isTyping, setIsTyping] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const provider = useEthersProvider();
  const { data } = useAddressType(award.address);

  const handleAddressChange = (value: string) => {
    setIsTyping(true);
    setAward({ ...award, address: value });
  };

  const handleERC20AddressBlur = async () => {
    setIsTyping(false);
    // if address is empty, dont do anything
    if (!award.address) {
      setAward({ ...award, state: 'input' });
      return;
    }
    // if address isn't valid, set error
    if (!data) {
      setAward({ ...award, state: 'error', error: 'Invalid address' });
      return;
    }
    if (AssetType[award.type] !== data) {
      setAward({ ...award, state: 'error', error: `Expected ERC20 and got ${data}` });
      return;
    } else {
      // address is valid, isn't an EOA, and matches the expected AssetType, so get token info
      const { name, image, symbol } = await getTokenInfo(award.address, provider);
      const { price } = await getUSDPrice(award.type, award.address, provider);
      setAward({ ...award, state: 'success', name, image, symbol, price });
    }
  };

  const handleTokenBlur = async (id: string) => {
    if (award.tokenId === '') return;

    const { image } = await getTokenIdImage(award.address, id, provider);
    setAward({ ...award, error: '', image });
  };

  const handleSelectAwardType = (selectedType: AssetType) => {
    setSelectedAwardType(selectedType);
    setAward({ ...NewAward, id: award.id, type: award.type });
  };

  const handleSelectErc20Award = async (token: ERC20) => {
    let updated: Partial<Award>;
    let type = AssetType.ERC20;

    const { price } = await getUSDPrice(type, erc20TokenAddresses[token], provider);

    // when selecting a new asset, reset the state
    token === ERC20.OTHER
      ? (updated = {
          amount: 1,
          address: '',
          state: 'input',
          selectedAsset: ERC20.OTHER,
          type: AssetType.ERC20,
        })
      : (updated = {
          amount: 1,
          state: 'success',
          selectedAsset: token,
          name: erc20Name[token],
          symbol: token,
          price,
          address: erc20TokenAddresses[token],
          type,
        });

    setAward({ ...award, ...updated });
  };

  const handleAddressBlur = async () => {
    setIsTyping(false);
    // if address is empty, dont do anything
    if (!award.address) {
      setAward({ ...award, state: 'input' });
      return;
    }

    // if address isn't valid, set error
    if (!data) {
      setAward({ ...award, state: 'error', error: 'Invalid address' });
      return;
    } else if (AssetType[award.type] !== data) {
      setAward({
        ...award,
        state: 'error',
        error: `Expected ${AssetType[award.type]} and got ${data}`,
      });
      return;
    } else {
      // address is valid, and matches the expected type, so get token info
      const { name, image, symbol } = await getTokenInfo(award.address, provider);

      setAward({ ...award, state: 'success', name, image, symbol });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(e.target.value);

    // If value is NaN or negative, set to 0
    if (isNaN(value) || value < 0) value = 0;

    setAward({ ...award, amount: value });
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

  const handleTokenId = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);

    // If value is NaN or negative, set to 0
    if (isNaN(value) || value < 0) {
      setAward({ ...award, tokenId: '0' });
    } else {
      setAward({ ...award, tokenId: e.target.value });
    }
  };

  const awardContent = (type: AssetType) => {
    if (type === AssetType.ETH)
      return (
        <Group gap={16}>
          <Group gap={6} classNames={classes.fullWidth}>
            <Text type="subtitle">Amount</Text>

            <input
              className={classes.votesInput}
              value={award.amount}
              placeholder="1"
              type="number"
              onChange={handleAmountChange}
              onPaste={handleInputPaste}
            />
          </Group>
        </Group>
      );

    if (type === AssetType.ERC20)
      return (
        <Group gap={16}>
          <Group gap={6}>
            <ERC20Buttons
              award={award}
              isTyping={isTyping}
              handleBlur={handleERC20AddressBlur}
              handleSwitch={() => setAward({ ...award, state: 'input' })}
              handleSelectAward={handleSelectErc20Award}
              handleChange={handleAddressChange}
            />
            {award.selectedAsset === ERC20.OTHER && (
              // allows user to look up the address on etherscan
              <ViewOnEtherscanButton address={award.address} isDisabled={!verifiedAddress} />
            )}
          </Group>

          <Group gap={6} classNames={classes.fullWidth}>
            <Text type="subtitle">Amount</Text>

            <input
              className={classes.votesInput}
              value={award.amount}
              placeholder="1"
              type="number"
              onChange={handleAmountChange}
              onPaste={handleInputPaste}
            />
          </Group>
        </Group>
      );

    if (type === AssetType.ERC721)
      return (
        <Group gap={16}>
          <Group gap={6}>
            <Group row gap={6}>
              <AwardAddress
                isTyping={isTyping}
                award={award}
                handleBlur={handleAddressBlur}
                handleSwitch={() => setAward({ ...award, state: 'input' })}
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
                  disabled={!verifiedAddress}
                  value={!verifiedAddress ? '' : award.tokenId}
                  placeholder="000"
                  type="number"
                  onChange={e => handleTokenId(e)}
                  onKeyDown={e => {
                    // allow blur on Enter
                    if (e.key === 'Enter') {
                      handleTokenBlur(award.tokenId!);
                      inputRef.current?.blur();
                    }
                  }}
                  onBlur={() => handleTokenBlur(award.tokenId!)}
                  onPaste={handleInputPaste}
                />
              </Group>
            </Group>
            {/* allows user to look up the address on OpenSea */}
            <ViewOnOpenSeaButton address={award.address} isDisabled={!verifiedAddress} />
          </Group>
        </Group>
      );

    if (type === AssetType.ERC1155)
      return (
        <Group gap={16}>
          <Group gap={6}>
            <Group row gap={6}>
              <AwardAddress
                isTyping={isTyping}
                award={award}
                handleBlur={handleAddressBlur}
                handleSwitch={() => setAward({ ...award, state: 'input' })}
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
                  className={classes.tokenIdInput}
                  disabled={!verifiedAddress}
                  value={!verifiedAddress ? '' : award.tokenId}
                  placeholder="0000"
                  type="number"
                  onChange={e => handleTokenId(e)}
                  onPaste={handleInputPaste}
                />
              </Group>
            </Group>

            <ViewOnOpenSeaButton address={award.address} isDisabled={!verifiedAddress} />
          </Group>
        </Group>
      );
  };

  return (
    <div className={classes.container}>
      <Group row gap={8} classNames={classes.buttons}>
        {/** Award type buttons */}
        {[AssetType.ETH, AssetType.ERC20, AssetType.ERC721, AssetType.ERC1155].map(type => (
          <div className={classes.stratBtnContainer} key={type}>
            <Button
              classNames={classes.strategyButton}
              text={assetTypeString(type)}
              bgColor={selectedAwardType === type ? ButtonColor.Purple : ButtonColor.White}
              onClick={() => handleSelectAwardType(type)}
            />
          </div>
        ))}
      </Group>
      <Divider />
      <Group>{awardContent(selectedAwardType)}</Group>
    </div>
  );
};

export default AddAward;
