import DeadlineDates from '../../DeadlineDates';
import Divider from '../../Divider';
import ReadMore from '../../ReadMore';
import EditSection from '../EditSection';
import Footer from '../Footer';
import Group from '../Group';
import InstructionBox from '../InstructionBox';
import RoundName from '../RoundName';
import Text from '../Text';

const CreateTheRound = () => {
  const auction: any = {
    id: 149,
    visible: true,
    title: 'Round 33',
    startTime: new Date('2023-02-06T22:00:00.000Z'),
    proposalEndTime: new Date('2023-02-11T22:00:00.000Z'),
    votingEndTime: new Date('2023-02-13T22:00:00.000Z'),
    fundingAmount: 1,
    createdDate: new Date('2023-02-06T12:00:00.000Z'),
    numWinners: 5,
    community: 8,
    currencyType: 'UMA',
    description:
      'Welcome to another weekly round of the UMA Prop House! Take your chance and submit a proposal detailing what you’d be willing to contribute for an opportunity to mint an UMA NFT. The best proposals include what you’re making, approximately how long it’s going to take & possibly a bit about yourself. Proposals which further the UMA ecosystem, lore & meme, or simply delight UMA token owners have the best chances at winning! If you have any questions please join our [UMA Discord](https://discord.com/invite/ryZsjTaryF) and ask away!',
    balanceBlockTag: 16572318,
  };

  return (
    <>
      <EditSection section="about" />
      <DeadlineDates round={auction} />
      <RoundName name="Nouns Video Contest Marketing Team" />
      <ReadMore
        description={
          <Text type="body">
            This Prop House round is specifically for people to propose how they will get people to
            enter the Nouns $200k Video Contest. The round is not about making a video, it is about
            getting other people to make videos and enter the main contest by whatever means.
          </Text>
        }
      />
      <EditSection section="votes" />

      <Divider />

      <EditSection section="awards" />

      <Divider />

      <Text type="title">Deposit funds for the round</Text>
      <InstructionBox
        title="Funding now vs later"
        text="You can add either contract addresses allowing anyone that holds the relevant ERC20/ERC721 to participate, or add any specific wallet addresses for individual access to the round."
      />

      <Group>
        <Text type="title">Tokens</Text>
      </Group>

      <Divider />

      <Group>
        <Text type="title">NFTS</Text>
      </Group>

      <Footer />
    </>
  );
};

export default CreateTheRound;
