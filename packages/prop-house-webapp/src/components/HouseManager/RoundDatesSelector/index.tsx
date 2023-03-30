import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Group from '../Group';
import Section from '../Section';
import Text from '../Text';
import TimedRound from '../TimedRound';

const RoundDatesSelector = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const [isTimedRound, setIsTimedRound] = useState(round.timedRound);

  const changeTimingType = () => {
    const updated = {
      ...round,
      timedRound: !round.timedRound,
      proposalPeriodStartUnixTimestamp: 0,
      proposalPeriodDurationSecs: 0,
      votePeriodDurationSecs: 0,
    };

    setIsTimedRound(!isTimedRound);
    dispatch(updateRound(updated));
    dispatch(checkStepCriteria());
  };

  return (
    <>
      <Group gap={4}>
        <Text type="subtitle">Select a round type</Text>
        <DualSectionSelector onChange={changeTimingType}>
          <Section
            active={isTimedRound}
            title="A time round"
            text="Set a specific end date and time for your round."
          />
          <Section
            active={!isTimedRound}
            title="Infinite round"
            text="A round that never ends and acts as a permanent pool of rewards."
          />
        </DualSectionSelector>
      </Group>

      <Divider />

      {isTimedRound ? <TimedRound round={round} /> : !isTimedRound && <div>infinite round</div>}
    </>
  );
};

export default RoundDatesSelector;
