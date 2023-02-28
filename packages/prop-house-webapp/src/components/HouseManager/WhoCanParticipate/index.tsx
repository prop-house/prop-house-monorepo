import Header from '../Header';
import Footer from '../Footer';
import Group from '../Group';
import InstructionBox from '../InstructionBox';
import VotingStrategies from '../VotingStrategies';

const WhoCanParticipate = () => {
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

      <VotingStrategies />

      <Footer />
    </>
  );
};

export default WhoCanParticipate;
