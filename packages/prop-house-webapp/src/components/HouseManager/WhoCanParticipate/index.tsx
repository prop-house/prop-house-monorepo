import classes from './WhoCanParticipate.module.css';
import Divider from '../../Divider';
import AddressWithVotes from '../AddressWithVotes';
import Footer from '../Footer';
import Group from '../Group';
import Header from '../Header';
import InstructionBox from '../InstructionBox';
import Text from '../Text';
import { useState } from 'react';
import { uuid } from 'uuidv4';
import { isAddress } from 'ethers/lib/utils';

export interface AddressWithVotesProps {
  id: string;
  addressValue: string;
  addressImage: string;
  addressName: string;
  votesPerToken: number;
  state: 'Input' | 'Searching' | 'Success' | 'Error';
  errorType?: 'AddressNotFound' | 'AddressAlreadyExists';
}

const initialAddress: AddressWithVotesProps = {
  id: uuid(),
  addressValue: '',
  addressImage: '',
  addressName: '',
  votesPerToken: 0,
  state: 'Input',
};

const WhoCanParticipate = () => {
  const [addresses, setAddresses] = useState<AddressWithVotesProps[]>([initialAddress]);
  const [isTyping, setIsTyping] = useState(false);

  const handleAddAddress = () => {
    setAddresses([...addresses, { ...initialAddress, id: uuid() }]);
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  const handleAddressChange = (id: string, value: string) => {
    // don't compare empty addresses
    const ignoreEmptyAddresses = addresses.filter(a => a.addressValue !== '');
    // check if address already exists
    const isDuplicateAddress = ignoreEmptyAddresses.some(a => a.addressValue === value);

    if (isDuplicateAddress) {
      setAddresses(
        addresses.map(address =>
          address.id === id
            ? { ...address, addressValue: value, state: 'Error', errorType: 'AddressAlreadyExists' }
            : address,
        ),
      );
    } else {
      setAddresses(
        addresses.map(address =>
          address.id === id ? { ...address, addressValue: value } : address,
        ),
      );
    }
  };

  const handleVotesPerTokenChange = (id: string, value: number) => {
    setAddresses(
      addresses.map(address =>
        address.id === id ? { ...address, votesPerToken: value } : address,
      ),
    );
  };

  const handleClickSuccess = (id: string) => {
    setAddresses(addresses.filter(address => address.id !== id));
    setAddresses(
      addresses.map(address => (address.id === id ? { ...address, state: 'Input' } : address)),
    );
  };

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

  //  BLUR
  const handleBlur = async (event: React.FocusEvent<HTMLInputElement>, id: string) => {
    setIsTyping(false);
    // check if its a valid address
    const addressToUpdate = addresses.find(address => address.id === id);

    const addressValue = event.target.value;

    // if address state was set to error but then the addressValue is now an empty string, reset the state to input
    if (addressToUpdate?.state === 'Error' && addressToUpdate.addressValue === '') {
      return setAddresses(
        addresses.map(address => (address.id === id ? { ...address, state: 'Input' } : address)),
      );
    }
    if (addressValue === '') return;

    const isInvalidAddress = !isAddress(addressValue);

    if (isInvalidAddress) {
      return setAddresses(
        addresses.map(address =>
          address.id === id
            ? { ...address, state: 'Error', errorType: 'AddressNotFound' }
            : address,
        ),
      );
    }

    if (addressToUpdate?.errorType === 'AddressAlreadyExists') return;

    setAddresses(
      addresses.map(address =>
        address.id === id
          ? { ...address, state: 'Searching', addressValue: event.target.value }
          : address,
      ),
    );

    try {
      const tokenInfo = await getTokenInfo(event.target.value);

      if (tokenInfo) {
        setAddresses(
          addresses.map(address =>
            address.id === id
              ? {
                  ...address,
                  state: 'Success',
                  addressImage: tokenInfo.image,
                  addressName: tokenInfo.name,
                }
              : address,
          ),
        );
      } else {
        console.log('handle image error');
      }
    } catch (error) {
      setAddresses(
        addresses.map(address => (address.id === id ? { ...address, state: 'Error' } : address)),
      );
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

      <Group gap={6} mb={16} mt={-10}>
        <Text type="subtitle">Token balance</Text>
        <Text type="body">Choose how many votes are allotted for each ERC20/ERC721 held.</Text>
      </Group>

      <Group gap={8}>
        <Group gap={12}>
          {addresses.map((address, index) => (
            <AddressWithVotes
              key={address.id}
              type="contract"
              address={address}
              isTyping={isTyping}
              setIsTyping={setIsTyping}
              addresses={addresses}
              remove={handleRemoveAddress}
              handleBlur={(event: any) => handleBlur(event, address.id)}
              handleClickSuccess={handleClickSuccess}
              onAddressValueChange={handleAddressChange}
              onVotesPerTokenChange={handleVotesPerTokenChange}
            />
          ))}
        </Group>

        <Text type="link" onClick={handleAddAddress}>
          Add another token
        </Text>
      </Group>

      <Divider />

      <Group gap={4}>
        <Text type="subtitle">Add additional voters by address</Text>
        <Text type="body">Provides a list of voter addresses that can participate.</Text>
      </Group>

      <Group>{/* <AddAddressWithVotes type="user" /> */}</Group>

      <div className={classes.addAddress}>
        <Text type="subtitle">Add another address</Text>
        <Text type="link">Upload CSV</Text>
      </div>

      <Footer />
    </>
  );
};

export default WhoCanParticipate;
