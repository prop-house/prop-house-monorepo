import classes from './Address.module.css';
import clsx from 'clsx';
import { capitalize } from '../../../utils/capitalize';
import trimEthAddress from '../../../utils/trimEthAddress';
import Button, { ButtonColor } from '../../Button';
import EthAddress from '../../EthAddress';
import Group from '../Group';
import Text from '../Text';
import { AddressProps } from '../VotingStrategies';
import Bullet from '../Bullet';

const Address: React.FC<{
  address: AddressProps;
  disableRemoval: boolean;
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
  handleRemove(address: AddressProps): void;
  handleClear(address: AddressProps): void;
  handleChange: (address: AddressProps, value: string) => void;
  handleVote: (address: AddressProps, votes: number) => void;
  handleBlur: (address: AddressProps) => void;
  handleInputTypeChange: (address: AddressProps) => void;
  placeholder?: string;
}> = props => {
  const {
    address,
    disableRemoval,
    isTyping,
    setIsTyping,
    handleRemove,
    handleClear,
    handleChange,
    handleVote,
    handleBlur,
    handleInputTypeChange,
    placeholder,
  } = props;

  // Handle change event on address input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    const newValue = e.target.value;

    handleChange(address, newValue);
  };

  // Vote button handlers
  const handleDecrement = () => handleVote(address, address.votesPerToken - 1);
  const handleIncrement = () => handleVote(address, address.votesPerToken + 1);

  // Vote input handler
  const handleVoteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value);
    // If value is NaN or negative, set to 1
    if (isNaN(value) || value < 1) value = 1;

    // If the value is greater than 3 digits, truncate it to first 3 digits
    // ie. 1234 -> 123
    if (value.toString().length > 3) value = Number(value.toString().substring(0, 3));

    handleVote(address, value);
  };

  // Handle paste event on vote input
  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clipboardData = e.clipboardData.getData('text');
    const value = parseInt(clipboardData, 10);
    if (isNaN(value) || value < 0) {
      e.preventDefault();
      return;
    }
  };

  // Boolean to check if address is a contract
  const isContract = address.type === 'contract';

  // Disabled states
  const oneVoteAllotted = address.votesPerToken === 1;

  const inputHasError = address.state === 'Error';

  // Error states
  const getErrorMessage = () => {
    switch (address.errorType) {
      case 'AddressNotFound':
        return 'Invalid address';
      case 'ContractAlreadyExists':
        return 'Contract already exists';
      case 'UserAlreadyExists':
        return 'User already exists';
      case 'UnidentifiedContract':
        return 'Unidentified contract';
      case 'NotUserAddress':
        return 'Not a user address';
      default:
        return 'Error';
    }
  };

  return (
    <>
      <div className={classes.container}>
        <Group gap={4} classNames={classes.addressAndTitle}>
          <Group row>
            <Text type="subtitle">{capitalize(address.type)} Address</Text>
            <Bullet />

            <Text
              type="link"
              disabled={address.state !== 'Success'}
              onClick={() => handleClear(address)}
            >
              clear
            </Text>
          </Group>

          {(address.state === 'Input' || inputHasError) && (
            <div className={classes.addressContainer}>
              <input
                className={clsx(
                  classes.addressInput,
                  address.state === 'Error' && classes.addressInputError,
                )}
                type="text"
                value={address.addressValue}
                onBlur={() => handleBlur(address)}
                onKeyPress={event => event.key === 'Enter' && handleBlur(address)}
                onChange={handleInputChange}
                placeholder={
                  placeholder ? placeholder : 'ex: 0x1234567890ABCDEF1234567890ABCDEF12345678'
                }
              />
            </div>
          )}

          {address.state === 'Searching' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>{trimEthAddress(address.addressValue)}</div>
              <div>Searching...</div>
            </div>
          )}

          {address.state === 'Success' && (
            <button
              className={classes.addressSuccess}
              onClick={() => handleInputTypeChange(address)}
            >
              {/*  if address.type === 'contract' show image and name
              else, its a user, show ENS/address with avatar */}
              {isContract ? (
                <div className={classes.addressImgAndTitle}>
                  <img src={address.addressImage} alt={address.addressName} />

                  <span>{address.addressName}</span>
                </div>
              ) : (
                <EthAddress address={address.addressValue} addAvatar />
              )}

              <div>{trimEthAddress(address.addressValue)}</div>
            </button>
          )}
        </Group>

        <div className={classes.voteContainer}>
          <Group gap={4}>
            <Text type="subtitle">{isContract ? 'Votes per token' : 'Votes per user'}</Text>

            <Group row gap={4}>
              <input
                maxLength={3}
                className={classes.voteInput}
                disabled={inputHasError}
                value={address.votesPerToken}
                type="number"
                onChange={handleVoteInputChange}
                onPaste={handleInputPaste}
              />
              <div className={classes.allotButtons}>
                <Button
                  text="-"
                  classNames={classes.button}
                  bgColor={ButtonColor.Gray}
                  onClick={handleDecrement}
                  disabled={oneVoteAllotted || inputHasError}
                />
                <Button
                  text="+"
                  disabled={inputHasError}
                  classNames={classes.button}
                  bgColor={ButtonColor.Gray}
                  onClick={handleIncrement}
                />
              </div>
            </Group>
          </Group>
        </div>

        <Button
          text="X"
          classNames={classes.xButton}
          bgColor={ButtonColor.White}
          onClick={() => handleRemove(address)}
          disabled={disableRemoval}
        />
      </div>

      {address.state === 'Error' && !isTyping && (
        <Group mt={-10}>
          <p className={classes.error}>{getErrorMessage()}</p>
        </Group>
      )}
    </>
  );
};

export default Address;
