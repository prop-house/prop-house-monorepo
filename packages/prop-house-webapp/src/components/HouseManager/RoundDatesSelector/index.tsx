import { useAppSelector } from '../../../hooks';
import TimedRound from '../TimedRound';

/**
 * @function changeTimingType - changes the round timing from timed to infinite or vice versa
 *
 * @components
 * @name DualSectionSelector - the wrapper for the two sections, handles changing the round timing type
 * @name Section - the two sections, timed & infinite
 * @name TimedRound - the timed round section
 */

const RoundDatesSelector = () => {
  const round = useAppSelector(state => state.round.round);

  return (
    <>
      {/** COMMENTED OUT UNTIL INFINITE ROUND IS SUPPORTED */}
      {/* <Group gap={4}>
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

      <Divider /> */}
      <TimedRound round={round} />
    </>
  );
};

export default RoundDatesSelector;
