import classes from './VotingStrategyModal.module.css';
import React, { Dispatch, SetStateAction, useState } from 'react';
import ReactModal from 'react-modal';
import { useTranslation } from 'react-i18next';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import Group from '../Group';
import { ButtonType, ButtonTypeProps } from '../WhoCanParticipate';
import Address from '../Address';

const VotingStrategyModal: React.FC<{
  buttonTypes: ButtonTypeProps[];
  selectedStrategy: string;
  // setSelectedStrategy: Dispatch<SetStateAction<string>>;
  handleSelectStrategy: (selectedType: ButtonType) => void;
  handleAddVotingStrategy: () => void;
  setShowVotingStrategyModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const {
    buttonTypes,
    selectedStrategy,
    // setSelectedStrategy,
    handleSelectStrategy,
    handleAddVotingStrategy,
    setShowVotingStrategyModal,
  } = props;
  const { t } = useTranslation();

  const closeModal = () => setShowVotingStrategyModal(false);

  console.log('selectedStrategy', selectedStrategy);
  const [address, setAddress] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // set input value to address
  const handleAddressChange = (value: string) => {
    setAddress(value);
  };

  const renderButtons = () => {
    return buttonTypes.map(buttonType => (
      <div className={classes.container} key={buttonType.id}>
        <Button
          classNames={classes.strategyButton}
          text={buttonType.label}
          bgColor={selectedStrategy === buttonType.label ? ButtonColor.Purple : ButtonColor.White}
          // onClick={() => setSelectedStrategy(buttonType.label)}
          onClick={handleSelectStrategy}
        />
      </div>
    ));
  };

  const renderContent = () => {
    switch (selectedStrategy) {
      case ButtonType.ERC721:
        return (
          <div>
            <h1>ERC-721 Content</h1>
            <p>This is the content for ERC-721</p>
            <Address
              address={address}
              isTyping={isTyping}
              setIsTyping={setIsTyping}
              // handleClear={()={}}
              // handleBlur={()={}}
              handleChange={handleAddressChange}
            />
          </div>
        );
      case ButtonType.ERC1155:
        return (
          <div>
            <h1>ERC-1155 Content</h1>
            <p>This is the content for ERC-1155</p>
          </div>
        );
      case ButtonType.ERC20:
        return (
          <div>
            <h1>ERC-20 Content</h1>
            <p>This is the content for ERC-20</p>
          </div>
        );
      case ButtonType.Allowlist:
        return (
          <div>
            <h1>Allowlist Content</h1>
            <p>This is the content for Allowlist</p>
          </div>
        );
      default:
        return (
          <div>
            <h1>Default Content</h1>
            <p>This is the default content</p>
          </div>
        );
    }
  };

  return (
    <ReactModal
      isOpen={true}
      appElement={document.getElementById('root')!}
      onRequestClose={closeModal}
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
            {renderButtons()}
          </Group>

          <Divider />

          <Group>{renderContent()}</Group>

          <div className={classes.footer}>
            <div className={classes.buttonContainer}>
              <Button text={t('Cancel')} bgColor={ButtonColor.White} onClick={closeModal} />

              <Button
                text={'Add'}
                disabled={true}
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
