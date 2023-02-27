import Divider from '../../Divider';
import Footer from '../Footer';
import Group from '../Group';
import Header from '../Header';
import InstructionBox from '../InstructionBox';
import { useState } from 'react';
import { uuid } from 'uuidv4';
import { changeAddress } from '../utils/changeAddress';
import trimEthAddress from '../../../utils/trimEthAddress';
import Text from '../Text';
import Address from '../Address';
import { isAddress } from 'ethers/lib/utils.js';
import Bullet from '../Bullet';
import { useAppSelector } from '../../../hooks';
import { useDispatch } from 'react-redux';
import { InitialRoundProps, setDisabled, updateRound } from '../../../state/slices/round';
import UploadCSVModal from '../../UploadCSVModal';
import { getTokenInfo } from '../utils/getTokenInfo';

export interface AddressProps {
  id: string;
  type: 'contract' | 'user';
  addressValue: string;
  addressImage: string;
  addressName: string;
  votesPerToken: number;
  state: 'Input' | 'Searching' | 'Success' | 'Error';
  errorType?:
    | 'AddressNotFound'
    | 'ContractAlreadyExists'
    | 'UserAlreadyExists'
    | 'UnidentifiedContract'
    | 'NotUserAddress';
}
const initialContractAddress: AddressProps = {
  id: uuid(),
  type: 'contract',
  addressValue: '',
  addressImage: '',
  addressName: '',
  votesPerToken: 0,
  state: 'Input',
};
const initialUserAddress: AddressProps = {
  id: uuid(),
  type: 'user',
  addressValue: '',
  addressImage: '',
  addressName: '',
  votesPerToken: 0,
  state: 'Input',
};

const WhoCanParticipate = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const [isTyping, setIsTyping] = useState(false);
  const [showUploadCSVModal, setShowUploadCSVModal] = useState(false);
  const [contracts, setContracts] = useState<AddressProps[]>(
    round.votingContracts.length ? round.votingContracts : [initialContractAddress],
  );
  const [userAddresses, setUserAddresses] = useState<AddressProps[]>(
    round.votingUsers.length ? round.votingUsers : [initialUserAddress],
  );

  const verifiedAddresses = (addresses: AddressProps[]) =>
    addresses.filter(a => a.state === 'Success');

  // Update the server with round changes
  const handleChange = (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => {
    const newRound = { ...round, [property]: value };
    dispatch(updateRound(newRound));

    const isStepCompleted =
      round.votingContracts.some(a => a.state === 'Success' && a.votesPerToken > 0) ||
      round.votingUsers.some(a => a.state === 'Success' && a.votesPerToken > 0);
    dispatch(setDisabled(!isStepCompleted));
  };

  // Add a new address to the array
  const handleAddAddress = (arrayType: 'contract' | 'user') =>
    arrayType === 'contract'
      ? setContracts([...contracts, { ...initialContractAddress, id: uuid() }])
      : setUserAddresses([...userAddresses, { ...initialUserAddress, id: uuid() }]);

  // Remove an address from the array
  const handleRemoveAddress = (address: AddressProps) => {
    const isContract = address.type === 'contract';

    const updatedArray = isContract
      ? contracts.filter(contract => contract.id !== address.id)
      : userAddresses.filter(userAddress => userAddress.id !== address.id);

    return isContract
      ? (setContracts(updatedArray),
        handleChange('votingContracts', verifiedAddresses(updatedArray)))
      : (setUserAddresses(updatedArray),
        handleChange('votingUsers', verifiedAddresses(updatedArray)));
  };

  // Update the address value for each address
  const handleAddressChange = (address: AddressProps, value: string) => {
    const isContract = address.type === 'contract';
    const array = isContract ? contracts : userAddresses;
    const updatedArray = changeAddress(address.id, array, { addressValue: value });
    return isContract ? setContracts(updatedArray) : setUserAddresses(updatedArray);
  };

  // Clear all values for an given address
  const handleAddressClear = (address: AddressProps) => {
    const isContract = address.type === 'contract';
    const array = isContract ? contracts : userAddresses;

    // Clear the address, but don't remove from UI
    const updatedArray = changeAddress(address.id, array, {
      addressValue: '',
      addressImage: '',
      addressName: '',
      votesPerToken: 0,
      state: 'Input',
    });

    // Update the UI state
    isContract ? setContracts(updatedArray) : setUserAddresses(updatedArray);

    // Remove the reset address from the server state
    handleChange(
      isContract ? 'votingContracts' : 'votingUsers',
      (isContract ? round.votingContracts : round.votingUsers).filter(a => a.id !== address.id),
    );
  };

  // Update the votes per token for each address
  const handleVoteChange = (address: AddressProps, votes: number) => {
    const isContract = address.type === 'contract';
    const array = isContract ? contracts : userAddresses;
    const updatedArray = changeAddress(address.id, array, { votesPerToken: votes });

    // Update the UI state
    isContract ? setContracts(updatedArray) : setUserAddresses(updatedArray);

    // Update the server state if the address is verified
    handleChange(isContract ? 'votingContracts' : 'votingUsers', verifiedAddresses(updatedArray));
  };

  // Clicking a successfully set address will change it back to an input
  const handleChangeSuccessToInput = (address: AddressProps) => {
    const isContract = address.type === 'contract';
    const array = isContract ? contracts : userAddresses;
    const updatedArray = changeAddress(address.id, array, { state: 'Input' });

    isContract ? setContracts(updatedArray) : setUserAddresses(updatedArray);

    // Since the address is no longer verified, remove it from the server state
    handleChange(isContract ? 'votingContracts' : 'votingUsers', verifiedAddresses(updatedArray));
  };

  // Generate a message that describes the voting power of each address
  const getVoterMessage = () => {
    const addressesToIgnore = (array: AddressProps[]) =>
      array
        // ignore empty addresses
        .filter(a => a.addressValue !== '')
        // ignore addresses with 0 votes
        .filter(a => a.votesPerToken !== 0);

    const contractMessages = addressesToIgnore(contracts).map(contract => {
      return `${contract.addressName} holders get ${contract.votesPerToken} ${
        contract.votesPerToken === 1 ? 'vote' : 'votes'
      }/token`;
    });

    const getName = (address: AddressProps) =>
      address.addressName !== '' ? address.addressName : trimEthAddress(address.addressValue);

    const userAddressMessages = addressesToIgnore(userAddresses).map(userAddress => {
      return `${getName(userAddress)} will have ${userAddress.votesPerToken} ${
        userAddress.votesPerToken === 1 ? 'vote' : 'votes'
      }`;
    });

    const messageParts = [...contractMessages, ...userAddressMessages];

    if (messageParts.length === 1) {
      // If there's only one part, return it as-is
      return messageParts[0];
    } else if (messageParts.length === 2) {
      // If there are two parts, join them with "and"
      return messageParts.join(' and ');
    } else if (messageParts.length > 2) {
      // If there are more than two parts, join all but the last with commas and join the last with "and"
      const lastPart = messageParts.pop();
      return `${messageParts.join(', ')}, and ${lastPart}`;
    } else {
      return '';
    }
  };

  // Validate address and update state
  const handleAddressBlur = async (address: AddressProps) => {
    setIsTyping(false);

    const isContract = address.type === 'contract';
    const setAddress = isContract ? setContracts : setUserAddresses;
    const array = isContract ? contracts : userAddresses;

    const isEmptyString = address.addressValue === '';
    const isValidAddressString = isAddress(address.addressValue);

    const isDuplicate = array
      .filter(a => a.addressValue !== '') // ignore empty addresses
      .filter(a => a.id !== address.id) // ignore the current address
      .some(a => a.addressValue === address.addressValue); // check if address already exists

    if (isEmptyString) {
      if (address.state === 'Error')
        setAddress(changeAddress(address.id, array, { state: 'Input' }));

      // if address is empty, don't do anything
      return;
    } else if (!isValidAddressString) {
      // if address isn't even the right format, set state to error
      setAddress(
        changeAddress(address.id, array, { state: 'Error', errorType: 'AddressNotFound' }),
      );
    } else if (isDuplicate) {
      // if address is a duplicate, set state to error
      setAddress(
        changeAddress(address.id, array, {
          state: 'Error',
          errorType: isContract ? 'ContractAlreadyExists' : 'UserAlreadyExists',
        }),
      );
    } else {
      // address is valid, fetch data
      if (isContract) {
        const tokenInfo = await getTokenInfo(address.addressValue);
        const { name, image } = tokenInfo;
        if (!name || !image) {
          setAddress(
            changeAddress(address.id, array, { state: 'Error', errorType: 'UnidentifiedContract' }),
          );
        } else {
          const updatedArray = changeAddress(address.id, array, {
            state: 'Success',
            addressImage: image,
            addressName: name,
          });

          handleChange('votingContracts', verifiedAddresses(updatedArray));

          setAddress(updatedArray);
        }
      } else {
        //  valid user address
        const updatedArray = changeAddress(address.id, array, { state: 'Success' });

        handleChange('votingUsers', verifiedAddresses(updatedArray));

        setAddress(updatedArray);
      }
    }
  };

  return (
    <>
      {showUploadCSVModal && <UploadCSVModal setShowUploadCSVModal={setShowUploadCSVModal} />}

      <Group gap={6} mb={16}>
        <Header
          title="Who's this for?"
          content={
            <InstructionBox
              title="Add contracts or wallets"
              text="You can add either contract addresses allowing anyone that holds the relevant ERC20/ERC721 to participate, or add any specific wallet addresses for individual access to the round."
            />
          }
        />
      </Group>

      <Group gap={6} mb={16} mt={-10}>
        <Text type="subtitle">Token balance</Text>
        <Text type="body">Choose how many votes are allotted for each ERC20/ERC721 held.</Text>
      </Group>

      <Group gap={8}>
        <Group gap={12}>
          {contracts.map(contract => (
            <Address
              key={contract.id}
              isTyping={isTyping}
              address={contract}
              disableRemoval={contracts.length === 1}
              setIsTyping={setIsTyping}
              handleRemove={handleRemoveAddress}
              handleClear={handleAddressClear}
              handleChange={handleAddressChange}
              handleVote={handleVoteChange}
              handleBlur={handleAddressBlur}
              handleInputTypeChange={handleChangeSuccessToInput}
            />
          ))}
        </Group>

        <Text type="link" onClick={() => handleAddAddress('contract')}>
          Add another token
        </Text>
      </Group>

      <Divider />

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
              disableRemoval={userAddresses.length === 1}
              setIsTyping={setIsTyping}
              handleRemove={handleRemoveAddress}
              handleChange={handleAddressChange}
              handleClear={handleAddressClear}
              handleVote={handleVoteChange}
              handleBlur={handleAddressBlur}
              handleInputTypeChange={handleChangeSuccessToInput}
            />
          ))}
        </Group>

        <Group row>
          <Text type="link" onClick={() => handleAddAddress('user')}>
            Add another address
          </Text>
          <Bullet />
          <Text type="link" onClick={() => setShowUploadCSVModal(true)}>
            Upload CSV
          </Text>
        </Group>
      </Group>

      {getVoterMessage().length ? (
        <Group mt={20}>
          <InstructionBox title="Vote allotment for your round" text={getVoterMessage()} />
        </Group>
      ) : (
        <></>
      )}

      <Footer />
    </>
  );
};

export default WhoCanParticipate;
