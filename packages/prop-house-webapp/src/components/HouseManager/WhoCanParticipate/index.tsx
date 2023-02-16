import classes from './WhoCanParticipate.module.css';
import Divider from '../../Divider';
import AddAddressWithVotes from '../AddAddressWithVotes';
import Footer from '../Footer';
import Group from '../Group';
import Header from '../Header';
import InstructionBox from '../InstructionBox';
import Text from '../Text';

const WhoCanParticipate = () => {
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
            <AddAddressWithVotes
              key={index}
              index={index}
              type="contract"
              remove={handleRemoveAddress}
              addresses={addresses}
              // setAddresses={setAddresses}
            />
          ))}
        </Group>
        {/* <AddAddressWithVotes type="contract" /> */}

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
