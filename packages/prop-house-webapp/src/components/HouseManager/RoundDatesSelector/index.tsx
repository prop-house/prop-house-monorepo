import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Group from '../Group';
import Section from '../Section';
import Text from '../Text';
import TimedRound from '../TimedRound';
import { saveRound } from '../../../state/thunks';
import { RoundType } from '@prophouse/sdk-react';

/**
 * @function changeTimingType - changes the round timing from timed to infinite or vice versa
 *
 * @components
 * @name DualSectionSelector - the wrapper for the two sections, handles changing the round timing type
 * @name Section - the two sections, timed & infinite
 * @name TimedRound - the timed round section
 */

const RoundDatesSelector = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const [isTimedRound, setIsTimedRound] = useState(round.roundType === RoundType.TIMED);

  const changeTimingType = () => {
    // TODO - returning to "disable" until we have designs for infinite round, after we can remove this
    if (isTimedRound) return;

    const updated = {
      ...round,
      proposalPeriodStartUnixTimestamp: 0,
      proposalPeriodDurationSecs: 0,
      votePeriodDurationSecs: 0,
    };

    setIsTimedRound(!isTimedRound);
    dispatch(saveRound(updated));
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

      {/* TODO - add <InfiniteRound /> whenever we have designs */}
      {isTimedRound ? <TimedRound round={round} /> : <div>infinite round</div>}
    </>
  );
};

export default RoundDatesSelector;
