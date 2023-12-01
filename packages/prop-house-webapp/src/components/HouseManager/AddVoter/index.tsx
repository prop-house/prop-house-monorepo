import classes from './AddVoter.module.css';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import Group from '../Group';
import { newVoter, NewVoter } from '../VotersConfig';
import VoterAddress from '../VoterAddress';
import Text from '../Text';
import Tooltip from '../../Tooltip';
import VotesPerAddress from '../VotesPerAddress';
import InfoSymbol from '../../InfoSymbol';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { AssetType, GovPowerStrategyConfig, VotingStrategyType } from '@prophouse/sdk-react';
import { getTokenInfo } from '../../../utils/getTokenInfo';
import useAddressType from '../../../hooks/useAddressType';
import { saveRound } from '../../../state/thunks';
import createVoterStrategy from '../../../utils/createVoterStrategy';
import { useEthersProvider } from '../../../hooks/useEthersProvider';

/**
 * @see StrategyType - button options within modal
 * @see addressTypes - strategy types to map over & display
 */

export enum StrategyType {
  ERC721 = 'ERC-721',
  ERC1155 = 'ERC-1155',
  ERC20 = 'ERC-20',
  Allowlist = 'Allowlist',
}

const addressTypes: StrategyType[] = [
  StrategyType.ERC721,
  StrategyType.ERC1155,
  StrategyType.ERC20,
  StrategyType.Allowlist,
];

const AddVoter: React.FC<{
  editMode?: boolean;
  voter: NewVoter;
  selectedStrategy: string;
  voters: GovPowerStrategyConfig[];
  setVoter: (strat: NewVoter) => void;
  setVoters: (voters: GovPowerStrategyConfig[]) => void;
  setSelectedStrategy: (selectedStrategy: string) => void;
  handleCancel: () => void;
}> = props => {
  const {
    editMode,
    voter,
    selectedStrategy,
    voters,
    setVoter,
    handleCancel,
    setVoters,
    setSelectedStrategy,
  } = props;
  const { t } = useTranslation();
  const provider = useEthersProvider();
  const dispatch = useAppDispatch();
  const round = useAppSelector(state => state.round.round);

  const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleAddVotingStrategy = () => {
    let v = createVoterStrategy(voter);

    if (v) {
      let updatedVoters: GovPowerStrategyConfig[] = [];

      if (v.strategyType === VotingStrategyType.ALLOWLIST) {
        // Find existing Whitelist strategy
        const existingStrategyIndex = voters.findIndex(
          existingStrategy => existingStrategy.strategyType === VotingStrategyType.ALLOWLIST,
        );

        if (existingStrategyIndex > -1) {
          const existingStrategy = voters[existingStrategyIndex];

          // Type guard to ensure existing strategy is a Whitelist strategy
          if ('members' in existingStrategy) {
            // Update existing Whitelist strategy by spreading in existing members
            const updatedStrategy = {
              ...existingStrategy,
              members: [...existingStrategy.members, ...v.members],
            };
            updatedVoters = [
              ...voters.slice(0, existingStrategyIndex),
              updatedStrategy,
              ...voters.slice(existingStrategyIndex + 1),
            ];
          } else {
            console.log('Invalid strategy type');
          }
        } else {
          // Add a new Whitelist strategy
          updatedVoters = [...voters, v];
        }
      } else {
        // Add non-Whitelist strategy
        updatedVoters = [...voters, v];
      }

      setVoters(updatedVoters);
      if (!editMode) dispatch(saveRound({ ...round, voters: updatedVoters }));
    }

    setVoter(newVoter);

    handleCloseModal();
  };

  const handleCloseModal = () => {
    handleCancel();
    setSelectedStrategy(StrategyType.ERC721);
  };

  const handleSelectStrategy = (selectedType: StrategyType) => {
    setSelectedStrategy(selectedType);

    if (selectedType === StrategyType.ERC721 || selectedType === StrategyType.ERC20) {
      setVoter({
        ...newVoter,
        type: VotingStrategyType.BALANCE_OF,
        asset: selectedType === StrategyType.ERC721 ? AssetType.ERC721 : AssetType.ERC20,
      });
    } else if (selectedType === StrategyType.ERC1155) {
      setVoter({
        ...newVoter,
        type: VotingStrategyType.BALANCE_OF_ERC1155,
        asset: AssetType.ERC1155,
      });
    } else if (selectedType === StrategyType.Allowlist) {
      setVoter({
        ...newVoter,
        type: VotingStrategyType.ALLOWLIST,
      });
    }
  };

  // Get address type by calling verification contract
  const { data } = useAddressType(voter.address);

  const handleAddressBlur = async () => {
    setIsTyping(false);

    // if address is empty, dont do anything
    if (!voter.address) {
      setVoter({ ...voter, state: 'input' });
      return;
    }

    const isDuplicate = voters.some(s => {
      if (
        s.strategyType !== VotingStrategyType.ALLOWLIST &&
        s.strategyType !== VotingStrategyType.VANILLA
      ) {
        return s.address.toLowerCase() === voter.address.toLowerCase();
      } else if (s.strategyType === VotingStrategyType.ALLOWLIST) {
        return s.members.some(m => m.address.toLowerCase() === voter.address.toLowerCase());
      } else {
        return null;
      }
    });

    if (isDuplicate) {
      setVoter({
        ...voter,
        state: 'error',
        error: 'Address already exists',
      });
      return;
    }

    // if address isn't valid, set error
    if (!data) {
      setVoter({ ...voter, state: 'error', error: 'Invalid address' });
      return;
    }

    // if address is EOA, check against string vs AssetType
    if (voter.type === VotingStrategyType.ALLOWLIST) {
      if (data !== 'EOA') {
        setVoter({
          ...voter,
          state: 'error',
          error: `Expected EOA and got ${data}`,
        });
      } else {
        setVoter({ ...voter, state: 'success' });
      }

      return;
      // if address is not EOA, check against AssetType
    } else if (AssetType[voter.asset] !== data) {
      setVoter({
        ...voter,
        state: 'error',
        error: `Expected ${AssetType[voter.asset]} and got ${data}`,
      });

      return;
    } else {
      // address is valid, isn't an EOA, and matches the expected AssetType, so get token info
      const { name, image } = await getTokenInfo(voter.address, provider);
      setVoter({ ...voter, state: 'success', name, image });
    }
  };

  const handleAddressChange = (value: string) => {
    setIsTyping(true);
    setVoter({ ...voter, address: value });
  };

  const handleSwitchInput = () => setVoter({ ...voter, state: 'input' });

  const handleAddressClear = () =>
    setVoter({
      ...voter,
      address: '',
      multiplier: 1,
      tokenId: '1',
      state: 'input',
      name: '',
      image: '',
    });

  const handleVoteChange = (votes: number) => setVoter({ ...voter, multiplier: votes });

  const handleTokenIdChange = (tokenId: string) => setVoter({ ...voter, tokenId });

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clipboardData = e.clipboardData.getData('text');
    let value = parseInt(clipboardData, 10);

    if (isNaN(value) || value < 0) {
      e.preventDefault();
      return;
    }
  };

  const verifiedAddress = voter.state === 'success';

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
        <VoterAddress
          voter={voter}
          isTyping={isTyping}
          handleBlur={handleAddressBlur}
          handleClear={handleAddressClear}
          handleSwitch={handleSwitchInput}
          handleChange={handleAddressChange}
        />
        <VotesPerAddress voter={voter} disabled={!verifiedAddress} handleVote={handleVoteChange} />
      </Group>
    ),
    [StrategyType.ERC1155]: (
      <Group gap={8}>
        <Group row gap={6}>
          <VoterAddress
            voter={voter}
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
              value={!verifiedAddress ? '' : voter.tokenId}
              placeholder="0000"
              type="number"
              onChange={e => handleTokenId(e)}
              onPaste={handleInputPaste}
            />
          </Group>
        </Group>

        <VotesPerAddress voter={voter} disabled={!verifiedAddress} handleVote={handleVoteChange} />
      </Group>
    ),
    [StrategyType.ERC20]: (
      <Group gap={8}>
        <VoterAddress
          voter={voter}
          isTyping={isTyping}
          handleBlur={handleAddressBlur}
          handleClear={handleAddressClear}
          handleSwitch={handleSwitchInput}
          handleChange={handleAddressChange}
        />
        <VotesPerAddress voter={voter} disabled={!verifiedAddress} handleVote={handleVoteChange} />
      </Group>
    ),
    [StrategyType.Allowlist]: (
      <Group gap={8}>
        <VoterAddress
          voter={voter}
          isTyping={isTyping}
          handleBlur={handleAddressBlur}
          handleClear={handleAddressClear}
          handleSwitch={handleSwitchInput}
          handleChange={handleAddressChange}
        />
        <VotesPerAddress voter={voter} disabled={!verifiedAddress} handleVote={handleVoteChange} />
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

export default AddVoter;
