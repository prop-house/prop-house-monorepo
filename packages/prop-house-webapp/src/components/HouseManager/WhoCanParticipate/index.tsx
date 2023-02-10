import Divider from '../../Divider';
import AddAddressWithVotes from '../AddAddressWithVotes';
import Footer from '../Footer';
import Group from '../Group';
import Header from '../Header';
import InstructionBox from '../InstructionBox';
import Text from '../Text';
import classes from './WhoCanParticipate.module.css';

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

      <Group>
        <Text type="subtitle">Token balance</Text>
        <Text type="body">Choose how many votes are allotted for each ERC20/ERC721 held.</Text>
      </Group>

      <Group>
        <AddAddressWithVotes type="contract" />
      </Group>

      <Text type="link">Add another token</Text>

      <Divider />

      <Group>
        <Text type="subtitle">Add additional voters by address</Text>
        <Text type="body">Provides a list of voter addresses that can participate.</Text>
      </Group>

      <Group>
        <AddAddressWithVotes type="user" />
      </Group>

      <div className={classes.addAddress}>
        <Text type="subtitle">Add another address</Text>
        <Text type="link">Upload CSV</Text>
      </div>

      <Footer />
    </>
  );
};

export default WhoCanParticipate;
