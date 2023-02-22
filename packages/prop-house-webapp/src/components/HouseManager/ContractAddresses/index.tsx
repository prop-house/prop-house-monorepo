import { isAddress } from 'ethers/lib/utils.js';
import Address from '../Address';
import Group from '../Group';
import Text from '../Text';
import { changeAddress } from '../utils/changeAddress';
import { AddressProps } from '../WhoCanParticipate';

const ContractAddresses: React.FC<{
  contracts: AddressProps[];
  setContracts: (value: AddressProps[]) => void;
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
    contracts,
    isTyping,
    setContracts,
    setIsTyping,
    handleAddAddress,
    handleRemoveAddress,
    handleAddressChange,
    handleVoteChange,
    handleChangeSuccessToInput,
    isContractAddress,
  } = props;

  // Get contract Name and Image from OpenSea API
  const getTokenInfo = async (contractAddress: string) => {
    try {
      const response = await fetch(
        `https://api.opensea.io/api/v1/asset_contract/${contractAddress}`,
      );
      if (!response.ok) {
        throw new Error(`Error fetching contract info: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const { name, image_url } = data;
      return { name, image: image_url };
    } catch (error) {
      console.error(error);
      throw new Error(`Error fetching contract info: ${error}`);
    }
  };

  //  Handle blur event on contract address input
  const handleContractAddressBlur = async (
    event: React.FocusEvent<HTMLInputElement>,
    address: AddressProps,
  ) => {
    setIsTyping(false);
    const inputValue = event.target.value;

    // if address state was set to error but then the addressValue is now an empty string, reset the state to input
    if (address.state === 'Error' && address.addressValue === '') {
      return setContracts(changeAddress(address.id, contracts, { state: 'Input' }));
    }

    // if inputValue is empty, don't do anything
    if (inputValue === '') return;

    // if inputValue is not empty, check if its a valid address
    const isInvalidAddress = !isAddress(inputValue);

    // if address is invalid, set state to error
    if (isInvalidAddress) {
      return setContracts(
        changeAddress(address.id, contracts, {
          state: 'Error',
          errorType: 'AddressNotFound',
        }),
      );
    }

    // if address is valid, check if its a duplicate
    if (address.errorType === 'ContractAlreadyExists') return;

    // check if address is a valid contract
    const isContract = await isContractAddress(address.addressValue);

    // set searching state
    setContracts(
      changeAddress(address!.id, contracts, {
        state: 'Searching',
        addressValue: inputValue,
      }),
    );

    try {
      const tokenInfo = await getTokenInfo(event.target.value);

      // if contract is not found, or is not a contract, set state to error and throw contract error
      if (tokenInfo.name === 'Unidentified contract' || !tokenInfo.image || !isContract) {
        setContracts(
          changeAddress(address.id, contracts, {
            state: 'Error',
            errorType: 'UnidentifiedContract',
          }),
        );
      } else if (tokenInfo.name && tokenInfo.image) {
        // if contract is found, set state to success and set image and name
        setContracts(
          changeAddress(address.id, contracts, {
            state: 'Success',
            addressImage: tokenInfo.image,
            addressName: tokenInfo.name,
          }),
        );
      } else {
        console.log('handle image error');
      }
    } catch (error) {
      setContracts(
        changeAddress(address.id, contracts, {
          state: 'Error',
        }),
      );
    }
  };

  return (
    <>
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
              addresses={contracts}
              setIsTyping={setIsTyping}
              handleRemove={handleRemoveAddress}
              handleChange={handleAddressChange}
              handleVote={handleVoteChange}
              handleBlur={handleContractAddressBlur}
              handleInputTypeChange={handleChangeSuccessToInput}
            />
          ))}
        </Group>

        <Text type="link" onClick={() => handleAddAddress('contract')}>
          Add another token
        </Text>
      </Group>
    </>
  );
};

export default ContractAddresses;
