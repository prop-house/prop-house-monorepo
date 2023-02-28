import { useEffect } from 'react';
import { useAppSelector } from '../../../hooks';
import { setDisabled } from '../../../state/slices/round';
import DeadlineDates from '../../DeadlineDates';
import Divider from '../../Divider';
import ReadMore from '../../ReadMore';
import AwardCard from '../AwardCard';
import CardWrapper from '../CardWrapper';
import EditSection from '../EditSection';
import Footer from '../Footer';
import Group from '../Group';
import InstructionBox from '../InstructionBox';
import StrategyCard from '../StrategyCard';
import Text from '../Text';

const CreateTheRound = () => {
  const round = useAppSelector(state => state.round.round);

  return (
    <>
      <DeadlineDates round={round} />

      <Group gap={6} mb={-10}>
        <Text type="heading">{round.title}</Text>
        <ReadMore description={<Text type="body">{round.description}</Text>} />
      </Group>

      <Divider narrow />

      <Group gap={16}>
        <EditSection section="votes" />
        <CardWrapper>
          <StrategyCard name="Nouns" />
          <StrategyCard name="Nouns" />
          <StrategyCard name="Nouns" />
          <StrategyCard name="Nouns" />
          <StrategyCard name="Nouns" />
        </CardWrapper>
      </Group>

      <Divider />

      <Group gap={16}>
        <EditSection section="awards" />
        <CardWrapper>
          <StrategyCard name="Nouns" />
          <StrategyCard name="Nouns" />
          <StrategyCard name="Nouns" />
        </CardWrapper>
      </Group>

      <Divider />

      <Group gap={16} mb={16}>
        <Text type="title">Deposit funds for the round</Text>
        <InstructionBox
          title="Funding now vs later"
          text="You can add either contract addresses allowing anyone that holds the relevant ERC20/ERC721 to participate, or add any specific wallet addresses for individual access to the round."
        />
      </Group>

      <Group>
        <Text type="title">Tokens</Text>
      </Group>

      <Divider />

      <Group>
        <Text type="title">NFTs</Text>
      </Group>

      <Footer />
    </>
  );
};

export default CreateTheRound;
