import classes from './AddAward.module.css';
import React, { SetStateAction, useRef } from 'react';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import Group from '../Group';
import { AwardType, ERC20 } from '../AwardsConfig';
import ViewOnOpenSeaButton from '../ViewOnOpenSeaButton';
import Text from '../Text';
import Tooltip from '../../Tooltip';
import InfoSymbol from '../../InfoSymbol';
import { AssetType } from '@prophouse/sdk-react';
import { getTokenInfo } from '../utils/getTokenInfo';
import useAddressType from '../utils/useAddressType';
import { Award, NewAward } from '../AssetSelector';
import AwardAddress from '../AwardAddress';
import { formatCommaNum } from '../utils/formatCommaNum';
import ViewOnEtherscanButton from '../ViewOnEtherscanButton';
import ERC20Buttons from '../ERC20Buttons';
import { useProvider } from 'wagmi';

const AddAward: React.FC<{
  award: Award;
  selectedAward: string;
  isTyping: boolean;
  setIsTyping: React.Dispatch<SetStateAction<boolean>>;
  setAward: (award: Award) => void;
  setSelectedAward: (selectedAward: string) => void;
  handleAddressChange: (value: string) => void;
  handleTokenBlur: (id: string) => void;
  handleSelectAward: (token: ERC20) => void;
  handleSwitchInput: () => void;
  handleERC20AddressBlur: () => void;
}> = props => {
  const {
    award,
    selectedAward,
    isTyping,
    setIsTyping,
    setAward,
    handleTokenBlur,
    setSelectedAward,
    handleAddressChange,
    handleSwitchInput,
    handleSelectAward,
    handleERC20AddressBlur,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const provider = useProvider();

  const handleSelectAwardType = (selectedType: AwardType) => {
    setSelectedAward(selectedType);

    // if you click the current award button, don't reset state
    if (selectedType.replace('-', '') === AssetType[award.type]) return;

    if (selectedType === AwardType.ERC721) {
      setAward({ ...NewAward, id: award.id, type: AssetType.ERC721 });
    } else if (selectedType === AwardType.ERC20) {
      setAward({ ...NewAward, id: award.id, type: AssetType.ERC20 });
    } else if (selectedType === AwardType.ERC1155) {
      setAward({ ...NewAward, id: award.id, type: AssetType.ERC1155 });
    }
  };

  // Get address type by calling verification contract
  const { data } = useAddressType(award.address);

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
    }
  };

  const awardTypes: AwardType[] = [AwardType.ERC20, AwardType.ERC721, AwardType.ERC1155];

  const verifiedAddress = award.state === 'success';

  const renderAwardButtons = () => {
    return awardTypes.map(type => (
      <div className={classes.stratBtnContainer} key={type}>
        <Button
          classNames={classes.strategyButton}
          text={type}
          bgColor={selectedAward === type ? ButtonColor.Purple : ButtonColor.White}
          onClick={() => handleSelectAwardType(type)}
        />
      </div>
    ));
  };

  const handleTokenId = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);

    // If value is NaN or negative, set to 0
    if (isNaN(value) || value < 0) value = 0;
    setAward({ ...award, tokenId: value.toString() });
  };

  const awardContent = {
    [AwardType.ERC20]: (
      <Group gap={16}>
        <Group gap={6}>
          <ERC20Buttons
            award={award}
            isTyping={isTyping}
            handleBlur={handleERC20AddressBlur}
            handleSwitch={handleSwitchInput}
            handleSelectAward={handleSelectAward}
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

          <Text type="body">${formatCommaNum(award.price * award.amount)}</Text>
        </Group>
      </Group>
    ),
    [AwardType.ERC721]: (
      <Group gap={16}>
        <Group gap={6}>
          <Group row gap={6}>
            <AwardAddress
              isTyping={isTyping}
              award={award}
              handleBlur={handleAddressBlur}
              handleSwitch={handleSwitchInput}
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
    ),
    [AwardType.ERC1155]: (
      <Group gap={16}>
        <Group gap={6}>
          <Group row gap={6}>
            <AwardAddress
              isTyping={isTyping}
              award={award}
              handleBlur={handleAddressBlur}
              handleSwitch={handleSwitchInput}
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
    ),
  };

  const renderContent = () => awardContent[selectedAward as AwardType];

  return (
    <div className={classes.container}>
      <Group row gap={8} classNames={classes.buttons}>
        {renderAwardButtons()}
      </Group>

      <Divider />

      <Group>{renderContent()}</Group>
    </div>
  );
};

export default AddAward;
