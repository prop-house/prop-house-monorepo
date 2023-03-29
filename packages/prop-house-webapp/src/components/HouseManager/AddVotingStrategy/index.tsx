import classes from './AddVotingStrategy.module.css';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import Group from '../Group';
import { StrategyType, newStrategy, NewStrategy } from '../StrategiesConfig';
import Address from '../Address';
import ViewOnOpenSeaButton from '../ViewOnOpenSeaButton';
import Text from '../Text';
import Tooltip from '../../Tooltip';
import VotesPerAddress from '../VotesPerAddress';
import InfoSymbol from '../../InfoSymbol';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  AssetType,
  VotingStrategyConfig,
  VotingStrategyType,
  WhitelistMember,
} from '@prophouse/sdk';
import { updateRound, checkStepCriteria } from '../../../state/slices/round';
import { getTokenInfo } from '../utils/getTokenInfo';
import useAddressType from '../utils/useAddressType';

const AddVotingStrategy: React.FC<{
  strat: NewStrategy;
  selectedStrategy: string;
  strategies: VotingStrategyConfig[];
  setStrat: (strat: NewStrategy) => void;
  setStrategies: (strategies: VotingStrategyConfig[]) => void;
  setSelectedStrategy: (selectedStrategy: string) => void;
  handleCancel: () => void;
}> = props => {
  const {
    strat,
    selectedStrategy,
    strategies,
    setStrat,
    handleCancel,
    setStrategies,
    setSelectedStrategy,
  } = props;
  const { t } = useTranslation();

  const round = useAppSelector(state => state.round.round);

  const [isTyping, setIsTyping] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  const handleAddVotingStrategy = () => {
    let s: VotingStrategyConfig | null = null;

    if (strat.type === VotingStrategyType.ERC1155_BALANCE_OF) {
      s = {
        strategyType: strat.type,
        assetType: AssetType.ERC1155,
        address: strat.address,
        tokenId: strat.tokenId,
        multiplier: strat.multiplier,
      };
    } else if (strat.type === VotingStrategyType.BALANCE_OF) {
      s = {
        strategyType: VotingStrategyType.BALANCE_OF,
        assetType: AssetType.ERC20,
        address: strat.address,
        multiplier: strat.multiplier,
      };
    } else if (strat.type === VotingStrategyType.WHITELIST) {
      const newMember: WhitelistMember = {
        address: strat.address,
        votingPower: strat.multiplier.toString(),
      };
      s = {
        strategyType: VotingStrategyType.WHITELIST,
        members: [newMember],
      };
    }

    if (s) {
      let updatedStrategies: VotingStrategyConfig[] = [];

      if (s.strategyType === VotingStrategyType.WHITELIST) {
        // Find existing Whitelist strategy
        const existingStrategyIndex = round.strategies.findIndex(
          existingStrategy => existingStrategy.strategyType === VotingStrategyType.WHITELIST,
        );

        if (existingStrategyIndex > -1) {
          const existingStrategy = round.strategies[existingStrategyIndex];

          // Type guard to ensure existing strategy is a Whitelist strategy
          if ('members' in existingStrategy) {
            // Update existing Whitelist strategy by spreading in existing members
            const updatedStrategy = {
              ...existingStrategy,
              members: [...existingStrategy.members, ...s.members],
            };
            updatedStrategies = [
              ...round.strategies.slice(0, existingStrategyIndex),
              updatedStrategy,
              ...round.strategies.slice(existingStrategyIndex + 1),
            ];
          } else {
            console.error('Invalid strategy type');
          }
        } else {
          // Add a new Whitelist strategy
          updatedStrategies = [...round.strategies, s];
        }
      } else {
        // Add non-Whitelist strategy
        updatedStrategies = [...round.strategies, s];
      }

      dispatch(updateRound({ ...round, strategies: updatedStrategies }));
      dispatch(checkStepCriteria());
      setStrategies(updatedStrategies);
    }

    setStrat(newStrategy);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    handleCancel();
    setSelectedStrategy(StrategyType.ERC721);
  };

  const handleSelectStrategy = (selectedType: StrategyType) => {
    setSelectedStrategy(selectedType);

    if (selectedType === StrategyType.ERC721 || selectedType === StrategyType.ERC20) {
      setStrat({
        ...newStrategy,
        type: VotingStrategyType.BALANCE_OF,
        asset: selectedType === StrategyType.ERC721 ? AssetType.ERC721 : AssetType.ERC20,
      });
    } else if (selectedType === StrategyType.ERC1155) {
      setStrat({
        ...newStrategy,
        type: VotingStrategyType.BALANCE_OF,
        asset: AssetType.ERC1155,
      });
    } else if (selectedType === StrategyType.Allowlist) {
      setStrat({
        ...newStrategy,
        type: VotingStrategyType.WHITELIST,
      });
    }
  };

  // Get address type by calling verification contract
  const { data } = useAddressType(strat.address);

  const handleAddressBlur = async () => {
    setIsTyping(false);

    // if address is empty, dont do anything
    if (!strat.address) {
      setStrat({ ...strat, state: 'input' });
      return;
    }

    const isDuplicate = strategies.some(s => {
      if (
        s.strategyType !== VotingStrategyType.WHITELIST &&
        s.strategyType !== VotingStrategyType.VANILLA
      ) {
        return s.address.toLowerCase() === strat.address.toLowerCase();
      } else if (s.strategyType === VotingStrategyType.WHITELIST) {
        return s.members.some(m => m.address.toLowerCase() === strat.address.toLowerCase());
      } else {
        return null;
      }
    });

    if (isDuplicate) {
      setStrat({
        ...strat,
        state: 'error',
        error: 'Address already exists',
      });
      return;
    }

    // if address isn't valid, set error
    if (!data) {
      setStrat({ ...strat, state: 'error', error: 'Invalid address' });
      return;
    }

    // if address is EOA, check against string vs AssetType
    if (strat.type === VotingStrategyType.WHITELIST) {
      if (data !== 'EOA') {
        setStrat({
          ...strat,
          state: 'error',
          error: `Expected EOA and got ${data}`,
        });
      } else {
        setStrat({ ...strat, state: 'success' });
      }

      return;
      // if address is not EOA, check against AssetType
    } else if (AssetType[strat.asset] !== data) {
      setStrat({
        ...strat,
        state: 'error',
        error: `Expected ${AssetType[strat.asset]} and got ${data}`,
      });

      return;
    } else {
      // address is valid, isn't an EOA, and matches the expected AssetType, so get token info
      const tokenInfo = await getTokenInfo(strat.address);
      const { name, collectionName, image } = tokenInfo;

      if (!name || !image) {
        setStrat({ ...strat, state: 'error', error: 'Unidentifed address' });
        return;
      } else {
        setStrat({
          ...strat,
          state: 'success',
          name: name === 'Unidentified contract' ? collectionName : name,
          image,
        });
      }
    }
  };

  const handleAddressChange = (value: string) => {
    setIsTyping(true);
    setStrat({ ...strat, address: value });
  };

  const handleSwitchInput = () => setStrat({ ...strat, state: 'input' });

  const handleAddressClear = () =>
    setStrat({
      ...strat,
      address: '',
      multiplier: 1,
      tokenId: '1',
      state: 'input',
      name: '',
      image: '',
    });

  const handleVoteChange = (votes: number) => setStrat({ ...strat, multiplier: votes });

  const handleTokenIdChange = (tokenId: string) => setStrat({ ...strat, tokenId });

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clipboardData = e.clipboardData.getData('text');
    let value = parseInt(clipboardData, 10);

    if (isNaN(value) || value < 0) {
      e.preventDefault();
      return;
    }
  };

  const addressTypes: StrategyType[] = [
    StrategyType.ERC721,
    StrategyType.ERC1155,
    StrategyType.ERC20,
    StrategyType.Allowlist,
  ];

  const verifiedAddress = strat.state === 'success';

  const renderAddressButtons = () => {
    return addressTypes.map(type => (
      <div className={classes.stratBtnContainer} key={type}>
        <Button
          classNames={classes.strategyButton}
          text={type}
          bgColor={selectedStrategy === type ? ButtonColor.Purple : ButtonColor.White}
          onClick={() => handleSelectStrategy(type)}
        />
      </div>
    ));
  };

  const handleTokenId = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    // If value is NaN or negative, set to 0
    if (isNaN(value) || value < 0) value = 0;

    handleTokenIdChange(value.toString());
  };

  const strategyContent = {
    [StrategyType.ERC721]: (
      <Group gap={8}>
        <Address
          strategy={strat}
          isTyping={isTyping}
          handleBlur={handleAddressBlur}
          handleClear={handleAddressClear}
          handleSwitch={handleSwitchInput}
          handleChange={handleAddressChange}
        />
        <VotesPerAddress
          strategy={strat}
          disabled={!verifiedAddress}
          handleVote={handleVoteChange}
        />
      </Group>
    ),
    [StrategyType.ERC1155]: (
      <Group gap={8}>
        <Group row gap={6}>
          <Address
            strategy={strat}
            isTyping={isTyping}
            handleBlur={handleAddressBlur}
            handleClear={handleAddressClear}
            handleSwitch={handleSwitchInput}
            handleChange={handleAddressChange}
          />
          <Group gap={4}>
            <Tooltip
              content={
                <Group row gap={4}>
                  <Text type="subtitle">Token ID</Text>

                  <InfoSymbol />
                </Group>
              }
              tooltipContent="Enter the ID of the token that voters must hold"
            />

            <input
              className={classes.tokenIdInput}
              disabled={!verifiedAddress}
              value={!verifiedAddress ? '' : strat.tokenId}
              placeholder="0000"
              type="number"
              onChange={e => handleTokenId(e)}
              onPaste={handleInputPaste}
            />
          </Group>
        </Group>

        <ViewOnOpenSeaButton address={strat.address} isDisabled={!verifiedAddress} />
        <VotesPerAddress
          strategy={strat}
          disabled={!verifiedAddress}
          handleVote={handleVoteChange}
        />
      </Group>
    ),
    [StrategyType.ERC20]: (
      <Group gap={8}>
        <Address
          strategy={strat}
          isTyping={isTyping}
          handleBlur={handleAddressBlur}
          handleClear={handleAddressClear}
          handleSwitch={handleSwitchInput}
          handleChange={handleAddressChange}
        />
        <VotesPerAddress
          strategy={strat}
          disabled={!verifiedAddress}
          handleVote={handleVoteChange}
        />
      </Group>
    ),
    [StrategyType.Allowlist]: (
      <Group gap={8}>
        <Address
          strategy={strat}
          isTyping={isTyping}
          handleBlur={handleAddressBlur}
          handleClear={handleAddressClear}
          handleSwitch={handleSwitchInput}
          handleChange={handleAddressChange}
        />
        <VotesPerAddress
          strategy={strat}
          disabled={!verifiedAddress}
          handleVote={handleVoteChange}
        />
      </Group>
    ),
  };

  const renderContent = () => strategyContent[selectedStrategy as StrategyType];

  return (
    <div className={classes.container}>
      <div>
        <div className={classes.titleContainer}>
          <p className={classes.modalTitle}>
            {selectedStrategy === 'Allowlist' ? 'Add a voter' : 'Add contract'}
          </p>
        </div>
      </div>
      <Divider />

      <Group row gap={8} classNames={classes.buttons}>
        {renderAddressButtons()}
      </Group>

      <Divider />

      <Group>{renderContent()}</Group>

      <div className={classes.footer}>
        <div className={classes.buttonContainer}>
          <Button text={t('Cancel')} bgColor={ButtonColor.White} onClick={handleCancel} />

          <Button
            text={'Add'}
            disabled={!verifiedAddress}
            bgColor={ButtonColor.Purple}
            onClick={handleAddVotingStrategy}
          />
        </div>
      </div>
    </div>
  );
};

export default AddVotingStrategy;
