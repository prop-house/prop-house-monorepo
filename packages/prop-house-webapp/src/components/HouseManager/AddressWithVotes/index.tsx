import classes from './AddressWithVotes.module.css';
import { capitalize } from '../../../utils/capitalize';
import Text from '../Text';
import Group from '../Group';
import Button, { ButtonColor } from '../../Button';
import { AddressWithVotesProps } from '../WhoCanParticipate';
import trimEthAddress from '../../../utils/trimEthAddress';
import clsx from 'clsx';

const AddressWithVotes: React.FC<{
  type: string;
  address: AddressWithVotesProps;
  addresses: AddressWithVotesProps[];
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
  remove: (id: string) => void;
  handleBlur: any;
  handleClickSuccess: (id: string) => void;
  onAddressValueChange: (id: string, newValue: string) => void;
  onVotesPerTokenChange: (id: string, newValue: number) => void;
}> = props => {
  const {
    type,
    address,
    addresses,
    isTyping,
    setIsTyping,
    remove,
    handleBlur,
    handleClickSuccess,
    onAddressValueChange,
    onVotesPerTokenChange,
  } = props;

  const handleAddressValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    const newValue = event.target.value;

    onAddressValueChange(address.id, newValue);
  };

  const handleDecrement = () => {
    if (address.votesPerToken > 0) {
      onVotesPerTokenChange(address.id, address.votesPerToken - 1);
    }
  };

  const handleIncrement = () => {
    onVotesPerTokenChange(address.id, address.votesPerToken + 1);
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const clipboardData = e.clipboardData.getData('text');
    const value = parseInt(clipboardData, 10);
    if (isNaN(value) || value < 0) {
      e.preventDefault();
      return;
    }
  };
  const handleInputChange = (e: any) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 0) value = 0;

    if (value.toString().length > 3) value = Number(value.toString().substring(0, 3));

    onVotesPerTokenChange(address.id, value);
  };

  const disableRemoveButton = addresses.length === 1;
  const inputHasError = address.state === 'Error';
  const isInvalidAddress = address.errorType === 'AddressNotFound';
  const isDuplicateAddress = address.errorType === 'AddressAlreadyExists';
  const isUnidentifiedContract = address.errorType === 'UnidentifiedContract';

  return (
    <>
      <div className={classes.container}>
        <Group gap={4} classNames={classes.addressAndTitle}>
          <Text type="subtitle">{capitalize(type)} Address</Text>

          {(address.state === 'Input' || inputHasError) && (
            <div className={classes.addressContainer}>
              <input
                className={clsx(
                  classes.addressInput,
                  address.state === 'Error' && classes.addressInputError,
                )}
                type="text"
                value={address.addressValue}
                onBlur={handleBlur}
                onChange={handleAddressValueChange}
                placeholder="ex: 0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03"
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
              onClick={() => handleClickSuccess(address.id)}
            >
              <div className={classes.addressImgAndTitle}>
                <img src={address.addressImage} alt={address.addressName} />

                <span>{address.addressName}</span>
              </div>

              <div>{trimEthAddress(address.addressValue)}</div>
            </button>
          )}
        </Group>

        <div className={classes.voteContainer}>
          <Group gap={4}>
            <Text type="subtitle">Votes per token</Text>

            <Group row gap={4}>
              <input
                maxLength={3}
                className={classes.voteInput}
                disabled={inputHasError}
                value={address.votesPerToken}
                type="number"
                onChange={handleInputChange}
                onPaste={handleInputPaste}
              />
              <div className={classes.allotButtons}>
                <Button
                  text="-"
                  classNames={classes.button}
                  bgColor={ButtonColor.Gray}
                  onClick={handleDecrement}
                  disabled={address.votesPerToken === 0 || inputHasError}
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
          onClick={() => remove(address.id)}
          disabled={disableRemoveButton}
        />
      </div>

      {address.state === 'Error' && !isTyping && (
        <Group mt={-10}>
          <p className={classes.error}>
            {isInvalidAddress && 'Invalid address, please check again'}
            {isDuplicateAddress && 'Contract already exists'}
            {isUnidentifiedContract && 'Unidenfitied contract'}
          </p>
        </Group>
      )}
    </>
  );
};

export default AddressWithVotes;
