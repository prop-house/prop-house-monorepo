import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { InitialRoundProps, setDisabled, updateRound } from '../../../state/slices/round';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Footer from '../Footer';
import Group from '../Group';
import Header from '../Header';
import Section from '../Section';
import Text from '../Text';
import TimedRound from '../TimedRound';

const RoundTiming = () => {
  const [activeSection, setActiveSection] = useState(0);

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleChange = (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => {
    const newRound = { ...round, [property]: value };
    dispatch(updateRound(newRound));

    const isStepCompleted =
      round.startTime !== null && round.proposalEndTime !== null && round.votingEndTime !== null;
    dispatch(setDisabled(!isStepCompleted));
  };

  const dataToBeCleared = {
    startTime: null,
    proposalEndTime: null,
    votingEndTime: null,
  };

  return (
    <>
      <Text type="heading">{round.title}</Text>
      <Divider narrow />

      <Header
        title="How long should the round run?"
        subtitle="Rounds start manually and can have a either a specific or undefined end time depending on what suites the needs for each round."
      />

      <Group>
        <Text type="subtitle">Select a round type</Text>
        <DualSectionSelector dataToBeCleared={dataToBeCleared} setActiveSection={setActiveSection}>
          <Section
            id={0}
            title="A time round"
            text="Set a specific end date and time for yourround."
            activeSection={activeSection}
          />
          <Section
            id={1}
            title="Infinite round"
            text="A round that never ends and acts as a permanent pool of rewards."
            activeSection={activeSection}
          />
        </DualSectionSelector>
      </Group>

      <Divider />

      {activeSection === 0 && <TimedRound handleChange={handleChange} round={round} />}
      {activeSection === 1 && <div>infinite round</div>}

      <Footer />
    </>
  );
};

export default RoundTiming;
