import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { InitialRoundProps, checkStepCriteria, updateRound } from '../../../state/slices/round';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Group from '../Group';
import Section from '../Section';
import Text from '../Text';
import TimedRound from '../TimedRound';

const RoundDatesSelector = () => {
  const [activeSection, setActiveSection] = useState(0);

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleChange = (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => {
    dispatch(updateRound({ ...round, [property]: value }));
    dispatch(checkStepCriteria());
  };

  const dataToBeCleared = {
    startTime: null,
    proposalEndTime: null,
    votingEndTime: null,
  };

  return (
    <>
      <Group gap={4}>
        <Text type="subtitle">Select a round type</Text>
        <DualSectionSelector dataToBeCleared={dataToBeCleared} setActiveSection={setActiveSection}>
          <Section
            id={0}
            title="A time round"
            text="Set a specific end date and time for your round."
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
    </>
  );
};

export default RoundDatesSelector;
