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

export interface AddressWithVotesProps {
  id: string;

  addressValue: string;
  votesPerToken: number;
}

const WhoCanParticipate = () => {
  const [addresses, setAddresses] = useState<AddressWithVotesProps[]>([
    { id: uuid(), addressValue: '', votesPerToken: 0 },
  ]);

  const addAddress = () => {
    setAddresses([...addresses, { id: uuid(), addressValue: '', votesPerToken: 0 }]);
  };

  const removeAddress = (id: string) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  const handleAddressValueChange = (id: string, newValue: string) => {
    setAddresses(oldAddresses => {
      const newAddresses = [...oldAddresses];
      const index = newAddresses.findIndex(address => address.id === id);
      newAddresses[index] = { ...newAddresses[index], addressValue: newValue };
      return newAddresses;
    });
  };

  const handleVotesPerTokenChange = (id: string, newValue: number) => {
    setAddresses(oldAddresses => {
      const newAddresses = [...oldAddresses];
      const index = newAddresses.findIndex(address => address.id === id);
      newAddresses[index] = { ...newAddresses[index], votesPerToken: newValue };
      return newAddresses;
    });
  };

  return (
    <>
      <Header
        title="Who's this for?"
        content={
          <InstructionBox
            title="Add contracts or wallets"
            text="You can add either contract addresses allowing anyone that holds the relevant ERC20/ERC721 to participate, or add any specific wallet addresses for individual access to the round."
          />
        }
      />

      <Group gap={6} mb={16}>
        <Text type="subtitle">Token balance</Text>
        <Text type="body">Choose how many votes are allotted for each ERC20/ERC721 held.</Text>
      </Group>

      <Group gap={8}>
        <Group gap={12}>
          {addresses.map((address, index) => (
            <AddressWithVotes
              key={address.id}
              index={index}
              type="contract"
              address={address}
              addresses={addresses}
              remove={removeAddress}
              onAddressValueChange={handleAddressValueChange}
              onVotesPerTokenChange={handleVotesPerTokenChange}
            />
          ))}
        </Group>

        <Text type="link" onClick={addAddress}>
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
