import classes from './UserAddresses.module.css';
import Address from '../Address';
import Group from '../Group';
import Text from '../Text';
import { isAddress } from 'ethers/lib/utils.js';
import { changeAddress } from '../utils/changeAddress';
import { AddressProps } from '../WhoCanParticipate';

const UserAddresses: React.FC<{
  userAddresses: AddressProps[];
  setUserAddresses: (value: AddressProps[]) => void;
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;
  handleAddAddress: (arrayType: 'contract' | 'user') => void;
  handleRemoveAddress: (address: AddressProps) => void;
  handleAddressChange: (address: AddressProps, value: string) => void;
  handleVoteChange: (address: AddressProps, votes: number) => void;
  handleChangeSuccessToInput: (address: AddressProps) => void;
  isContractAddress: (address: string) => Promise<boolean>;
}> = props => {
  const {
    userAddresses,
    isTyping,
    setUserAddresses,
    setIsTyping,
    handleAddAddress,
    handleRemoveAddress,
    handleAddressChange,
    handleVoteChange,
    handleChangeSuccessToInput,
    isContractAddress,
  } = props;

  // Handle blur event on user address input
  const handleUserAddressBlur = async (
    event: React.FocusEvent<HTMLInputElement>,
    address: AddressProps,
  ) => {
    setIsTyping(false);
    const inputValue = event.target.value;

    // if address state was set to error but then the addressValue is now an empty string, reset the state to input
    if (address.state === 'Error' && address.addressValue === '') {
      return setUserAddresses(changeAddress(address.id, userAddresses, { state: 'Input' }));
    }

    // if input value is empty, don't do anything
    if (inputValue === '') return;

    // if input value is not empty, check if its a valid address
    const isInvalidAddress = !isAddress(inputValue);

    // if address is invalid, set state to error
    if (isInvalidAddress) {
      return setUserAddresses(
        changeAddress(address!.id, userAddresses, {
          state: 'Error',
          errorType: 'AddressNotFound',
        }),
      );
    }

    // if address is valid, check if its a duplicate
    if (address.errorType === 'UserAlreadyExists') return;

    // check if address is a valid contract
    const isContract = await isContractAddress(address.addressValue);

    // if address is a contract, set state to error and return
    if (isContract) {
      return setUserAddresses(
        changeAddress(address.id, userAddresses, {
          state: 'Error',
          errorType: 'NotUserAddress',
        }),
      );
    }

    // if address has an ENS name, set the ens string to the addressName

    // set searching state
    setUserAddresses(
      changeAddress(address.id, userAddresses, {
        state: 'Searching',
        addressValue: inputValue,
      }),
    );

    setUserAddresses(
      changeAddress(address.id, userAddresses, {
        state: 'Success',
        addressValue: inputValue,
      }),
    );
  };

  return (
    <>
      <Group gap={4} mb={16}>
        <Text type="subtitle">Add additional voters by address</Text>
        <Text type="body">Provides a list of voter addresses that can participate.</Text>
      </Group>

      <Group gap={8}>
        <Group gap={12}>
          {userAddresses.map(userAddress => (
            <Address
              key={userAddress.id}
              isTyping={isTyping}
              address={userAddress}
              addresses={userAddresses}
              setIsTyping={setIsTyping}
              handleRemove={handleRemoveAddress}
              handleChange={handleAddressChange}
              handleVote={handleVoteChange}
              handleBlur={handleUserAddressBlur}
              handleInputTypeChange={handleChangeSuccessToInput}
            />
          ))}
        </Group>

        <div className={classes.addAddress}>
          <Text type="link" onClick={() => handleAddAddress('user')}>
            Add another address
          </Text>
          <Text type="link">Upload CSV</Text>
        </div>
      </Group>
    </>
  );
};

export default UserAddresses;
