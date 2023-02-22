import Divider from '../../Divider';
import Footer from '../Footer';
import Group from '../Group';
import Header from '../Header';
import InstructionBox from '../InstructionBox';
import { useEffect, useState } from 'react';
import { uuid } from 'uuidv4';
import { changeAddress } from '../utils/changeAddress';
import ContractAddresses from '../ContractAddresses';
import UserAddresses from '../UserAddresses';
import trimEthAddress from '../../../utils/trimEthAddress';
import { useProvider } from 'wagmi';

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
  const [isTyping, setIsTyping] = useState(false);
  const [contracts, setContracts] = useState<AddressProps[]>([initialContractAddress]);
  const [userAddresses, setUserAddresses] = useState<AddressProps[]>([initialUserAddress]);
  const [showVoterMessage, setShowVoterMessage] = useState(false);

  const provider = useProvider();

  const handleAddAddress = (arrayType: 'contract' | 'user') =>
    arrayType === 'contract'
      ? setContracts([...contracts, { ...initialContractAddress, id: uuid() }])
      : setUserAddresses([...userAddresses, { ...initialUserAddress, id: uuid() }]);

  const handleAddressChange = (address: AddressProps, value: string) => {
    const isContract = address.type === 'contract';
    const array = isContract ? contracts : userAddresses;

    // don't compare empty addresses
    const ignoreEmptyAddresses = array.filter(a => a.addressValue !== '');
    // check if address already exists
    const isDuplicateAddress = ignoreEmptyAddresses.some(a => a.addressValue === value);

    let changes = {};

    // if address is a duplicate, set error state
    if (isDuplicateAddress) {
      changes = {
        addressValue: value,
        state: 'Error',
        errorType: isContract ? 'ContractAlreadyExists' : 'UserAlreadyExists',
      };
    } else {
      // if address is not a duplicate, set input state like normal
      changes = { addressValue: value };
    }

    const updatedArray = changeAddress(address.id, array, changes);
    return isContract ? setContracts(updatedArray) : setUserAddresses(updatedArray);
  };

  const handleRemoveAddress = (address: AddressProps) =>
    address.type === 'contract'
      ? setContracts(contracts.filter(contract => contract.id !== address.id))
      : setUserAddresses(userAddresses.filter(userAddress => userAddress.id !== address.id));

  const handleVoteChange = (address: AddressProps, votes: number) => {
    const array = address.type === 'contract' ? contracts : userAddresses;
    const changes = { votesPerToken: votes };
    const updatedArray = changeAddress(address.id, array, changes);

    return address.type === 'contract'
      ? setContracts(updatedArray)
      : setUserAddresses(updatedArray);
  };

  const handleChangeSuccessToInput = (address: AddressProps) => {
    const array = address.type === 'contract' ? contracts : userAddresses;
    const updatedArray = changeAddress(address.id, array, { state: 'Input' });

    return address.type === 'contract'
      ? setContracts(updatedArray)
      : setUserAddresses(updatedArray);
  };

  const isContractAddress = async (address: string) => {
    const bytecode = await provider.getCode(address);
    return bytecode !== '0x';
  };

  const addressesToIgnore = (array: AddressProps[]) =>
    array
      // ignore empty addresses
      .filter(a => a.addressValue !== '')
      // ignore addresses with 0 votes
      .filter(a => a.votesPerToken !== 0);

  useEffect(() => {
    const nonEmptyContracts = addressesToIgnore(contracts);
    const nonEmptyUserAddresses = addressesToIgnore(userAddresses);
    if (nonEmptyContracts.length > 0 || nonEmptyUserAddresses.length > 0) {
      setShowVoterMessage(true);
    }
  }, [contracts, userAddresses]);

  // Generate a message that describes the voting power of each address
  const getVoterMessage = () => {
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

  return (
    <>
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

      <ContractAddresses
        isTyping={isTyping}
        contracts={contracts}
        setContracts={setContracts}
        setIsTyping={setIsTyping}
        isContractAddress={isContractAddress}
        handleAddAddress={handleAddAddress}
        handleRemoveAddress={handleRemoveAddress}
        handleAddressChange={handleAddressChange}
        handleVoteChange={handleVoteChange}
        handleChangeSuccessToInput={handleChangeSuccessToInput}
      />

      <Divider />

      <UserAddresses
        isTyping={isTyping}
        userAddresses={userAddresses}
        setUserAddresses={setUserAddresses}
        setIsTyping={setIsTyping}
        isContractAddress={isContractAddress}
        handleAddAddress={handleAddAddress}
        handleRemoveAddress={handleRemoveAddress}
        handleAddressChange={handleAddressChange}
        handleVoteChange={handleVoteChange}
        handleChangeSuccessToInput={handleChangeSuccessToInput}
      />

      {showVoterMessage && !isTyping && (
        <Group mt={20}>
          <InstructionBox title="Vote allotment for your round" text={getVoterMessage()} />
        </Group>
      )}

      <Footer />
    </>
  );
};

export default WhoCanParticipate;
