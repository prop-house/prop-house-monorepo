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
import { useDispatch } from 'react-redux';

const CreateTheRound = () => {
  const round = useAppSelector(state => state.round.round);
  const addresses = [...round.votingContracts, ...round.votingUsers];
  const dispatch = useDispatch();

  // need to watch for changes to round and set disabled accordingly if criteria is met
  useEffect(() => {
    // Dispatch the setDisabled action with the validation check for step 5
    // TODO: cleanup?
    const isStepCompleted =
      5 <= round.title.length &&
      round.title.length <= 255 &&
      20 <= round.description.length &&
      (round.votingContracts.some(c => c.state === 'Success' && c.votesPerToken > 0) ||
        round.votingUsers.some(u => u.state === 'Success' && u.votesPerToken > 0)) &&
      round.awards.some(c => c.state === 'Success') &&
      round.numWinners !== 0 &&
      round.fundingAmount !== 0 &&
      round.startTime !== null &&
      round.proposalEndTime !== null &&
      round.votingEndTime !== null;

    dispatch(setDisabled(!isStepCompleted));
  }, [dispatch, round]);

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
          {addresses.map(a => (
            <StrategyCard address={a} />
          ))}
        </CardWrapper>
      </Group>

      <Divider />

      <Group gap={16}>
        <EditSection section="awards" />
        <CardWrapper>
          {[...Array(round.numWinners)].map((award, idx) => (
            <AwardCard amount={round.fundingAmount} award={round.awards[0]} place={idx + 1} />
          ))}
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
