import classes from './VotingStrategyModal.module.css';
import React from 'react';
import ReactModal from 'react-modal';
import { useTranslation } from 'react-i18next';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import Group from '../Group';
import { AddressType, NewStrategy } from '../WhoCanParticipate';
import Address from '../Address';
import ViewOnOpenSeaButton from '../ViewOnOpenSeaButton';

import Text from '../Text';
import Tooltip from '../../Tooltip';
import VotesPerAddress from '../VotesPerAddress';
import InfoSymbol from '../../InfoSymbol';

const VotingStrategyModal: React.FC<{
  selectedStrategy: string;
  strategy: NewStrategy;
  isTyping: boolean;
  handleVote: (votes: number) => void;
  handleBlur: () => void;
  handleClear: () => void;
  handleSwitch: () => void;
  handleCloseModal: () => void;
  handleOnChange: (address: string) => void;
  handleTokenIdChange: (tokenId: string) => void;
  handleSelectStrategy: (selectedType: AddressType) => void;
  handleAddVotingStrategy: () => void;
}> = props => {
  const {
    strategy,
    selectedStrategy,
    isTyping,
    handleVote,
    handleBlur,
    handleClear,
    handleSwitch,
    handleOnChange,
    handleCloseModal,
    handleTokenIdChange,
    handleSelectStrategy,
    handleAddVotingStrategy,
  } = props;
  const { t } = useTranslation();

  const addressTypes: AddressType[] = [
    AddressType.ERC721,
    AddressType.ERC1155,
    AddressType.ERC20,
    AddressType.Allowlist,
  ];

  const verifiedAddress = strategy.state === 'success';

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
    [AddressType.ERC721]: (
      <Group gap={8}>
        <Address
          strategy={strategy}
          isTyping={isTyping}
          handleBlur={handleBlur}
          handleClear={handleClear}
          handleSwitch={handleSwitch}
          handleChange={handleOnChange}
        />
        <VotesPerAddress strategy={strategy} disabled={!verifiedAddress} handleVote={handleVote} />
      </Group>
    ),
    [AddressType.ERC1155]: (
      <Group gap={8}>
        <Group row gap={6}>
          <Address
            strategy={strategy}
            isTyping={isTyping}
            handleBlur={handleBlur}
            handleClear={handleClear}
            handleSwitch={handleSwitch}
            handleChange={handleOnChange}
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
              value={!verifiedAddress ? '' : strategy.tokenId}
              placeholder="0000"
              type="number"
              onChange={e => handleTokenId(e)}
              // onPaste={handleInputPaste}
            />
          </Group>
        </Group>

        <ViewOnOpenSeaButton address={strategy.address} isDisabled={!verifiedAddress} />
        <VotesPerAddress strategy={strategy} disabled={!verifiedAddress} handleVote={handleVote} />
      </Group>
    ),
    [AddressType.ERC20]: (
      <Group gap={8}>
        <Address
          strategy={strategy}
          isTyping={isTyping}
          handleBlur={handleBlur}
          handleClear={handleClear}
          handleSwitch={handleSwitch}
          handleChange={handleOnChange}
        />
        <VotesPerAddress strategy={strategy} disabled={!verifiedAddress} handleVote={handleVote} />
      </Group>
    ),
    [AddressType.Allowlist]: (
      <Group gap={8}>
        <Address
          strategy={strategy}
          isTyping={isTyping}
          handleBlur={handleBlur}
          handleClear={handleClear}
          handleSwitch={handleSwitch}
          handleChange={handleOnChange}
        />
        <VotesPerAddress strategy={strategy} disabled={!verifiedAddress} handleVote={handleVote} />
      </Group>
    ),
  };

  const renderContent = () => strategyContent[selectedStrategy as AddressType];

  return (
    <ReactModal
      isOpen={true}
      appElement={document.getElementById('root')!}
      onRequestClose={handleCloseModal}
      className={classes.modal}
    >
      <>
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
              <Button text={t('Cancel')} bgColor={ButtonColor.White} onClick={handleCloseModal} />

              <Button
                text={'Add'}
                disabled={!verifiedAddress}
                bgColor={ButtonColor.Purple}
                onClick={handleAddVotingStrategy}
              />
            </div>
          </div>
        </div>
      </>
    </ReactModal>
  );
};

export default VotingStrategyModal;
