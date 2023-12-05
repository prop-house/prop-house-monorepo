import classes from './TimedRoundDateSelector.module.css';
import 'react-datetime/css/react-datetime.css';
import Divider from '../../Divider';
import DateTimeInput from '../DateTimeInput';
import Group from '../Group';
import Text from '../Text';
import { validStartDate } from '../../../utils/isValidDate';
import { TimePeriod, CustomPeriod } from '../TimePeriod';
import NumberInput from '../NumberInput';
import Bullet from '../Bullet';
import formatDateTime from '../../../utils/formatDateTime';
import { getDateFromTimestamp } from '../../../utils/getDateFromTimestamp';
import { getSecondsFromDays } from '../../../utils/getSecondsFromDays';
import { NewRound } from '../../../state/slices/round';
import { useState } from 'react';
import { getDateFromDuration } from '../../../utils/getDateFromDuration';
import { getDaysFromSeconds } from '../../../utils/getDaysFromSeconds';
import { getDurationBetweenDatesInSeconds } from '../../../utils/getDurationBetweenDatesInSeconds';
import { getTimestampFromDate } from '../../../utils/getTimestampFromDate';
import { useDispatch } from 'react-redux';
import { saveRound } from '../../../state/thunks';

/**
 * @function changeTimingType - changes the round timing from timed to infinite or vice versa
 *
 * @components
 * @name DateTimeInput - the `react-datetime` input for the start date
 * @name TimePeriod - the 3 buttons for fixed durations: 5 days, 7 days, 14 days
 * @name CustomPeriod - button to select a custom duration
 * @name NumberInput - number input for custom duration in days
 *
 * @see editMode - used to determine whether or not we're editing from Step 6,
 * in which case we don't want to dispatch the saveRound thunk, rather we want to
 * track the changes in the parent component and dispatch the saveRound thunk
 * when the user clicks "Save Changes"
 */

const TimedRoundDateSelector: React.FC<{
  round: NewRound;
  editMode?: boolean;
  setEditedRound?: (round: NewRound) => void;
}> = props => {
  const { round, editMode, setEditedRound } = props;
  const dispatch = useDispatch();

  const [startTime, setStartTime] = useState(round.proposalPeriodStartUnixTimestamp);
  const [proposingDuration, setProposingDuartion] = useState(
    getDaysFromSeconds(round.proposalPeriodDurationSecs),
  );
  const [votingDuration, setVotingDuration] = useState(
    getDaysFromSeconds(round.votePeriodDurationSecs),
  );
  const propEndDate = getDateFromDuration(
    getDateFromTimestamp(startTime),
    getSecondsFromDays(proposingDuration),
  );
  const voteEndDate = getDateFromDuration(propEndDate, getSecondsFromDays(votingDuration));

  const periods = [5, 7, 14];

  const [customProposingPeriod, setCustomProposingPeriod] = useState(
    startTime === 0
      ? false
      : // Flow: get proposal end date by calculating the duration between the start date (by getting date from the start time unix timestamp) and the selected proposal period duration (x-days from start date calculated by converting propsingDuration seconds to whole numbe of days), then get the duration between the start date and the proposal end date in seconds, then convert that duration to days, and check if that duration is in the periods array, if its not 5, 7, or 14 days, then it's a custom duration
        !periods.includes(
          getDaysFromSeconds(
            getDurationBetweenDatesInSeconds(
              getDateFromTimestamp(startTime),
              getDateFromDuration(
                getDateFromTimestamp(startTime),
                getSecondsFromDays(proposingDuration),
              ),
            ),
          ),
        ),
  );

  const [customVotingPeriod, setCustomVotingPeriod] = useState(
    proposingDuration === 0
      ? false
      : // same as avove but for proposing period but with the voting period duration
        !periods.includes(
          getDaysFromSeconds(
            getDurationBetweenDatesInSeconds(
              getDateFromDuration(
                getDateFromTimestamp(startTime),
                getSecondsFromDays(proposingDuration),
              ),
              getDateFromDuration(
                getDateFromTimestamp(startTime),
                getSecondsFromDays(proposingDuration + votingDuration),
              ),
            ),
          ),
        ),
  );

  const handleSelectStartTime = (date: Date) => {
    setStartTime(getTimestampFromDate(date));
    // Reminder: in edit mode we are not dispatching updates to the store onClick, rather we are tracking the changes in the parent component and dispatching the saveRound thunk when the user clicks "Save Changes"
    if (editMode) {
      setEditedRound!({ ...round, proposalPeriodStartUnixTimestamp: getTimestampFromDate(date) });
    } else {
      dispatch(
        saveRound({ ...round, proposalPeriodStartUnixTimestamp: getTimestampFromDate(date) }),
      );
    }
  };

  const handleDurationChange = (duration: number, isProposingPeriod: boolean) => {
    if (isProposingPeriod) {
      setCustomProposingPeriod(false);
      setProposingDuartion(duration);
      if (editMode) {
        setEditedRound!({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(duration) });
      } else {
        dispatch(saveRound({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(duration) }));
      }
    } else {
      setCustomVotingPeriod(false);
      setVotingDuration(duration);
      if (editMode) {
        setEditedRound!({ ...round, votePeriodDurationSecs: getSecondsFromDays(duration) });
      } else {
        dispatch(saveRound({ ...round, votePeriodDurationSecs: getSecondsFromDays(duration) }));
      }
    }
  };

  const handleProposalInputChange = (duration: number) => {
    setProposingDuartion(duration);
    if (editMode) {
      setEditedRound!({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(duration) });
    } else {
      dispatch(saveRound({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(duration) }));
    }
  };
  const handleVotingInputChange = (duration: number) => {
    setVotingDuration(duration);
    if (editMode) {
      setEditedRound!({ ...round, votePeriodDurationSecs: getSecondsFromDays(duration) });
    } else {
      dispatch(saveRound({ ...round, votePeriodDurationSecs: getSecondsFromDays(duration) }));
    }
  };

  const handleSelectCustomPeriod = (isProposingPeriod: boolean) => {
    if (isProposingPeriod) {
      setCustomProposingPeriod(true);
      // set proposing duration to 15 days (1 more than the highest value in the periods array when the custom button is clicked)
      // if they enter a custom duration that is equal to a predefined duration (e.g. 7) and go to the next step and then return back,
      // the predefined button will be selected instead as it's the same duration and makes more sense to the user
      setProposingDuartion(15);
      if (editMode) {
        setEditedRound!({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(15) });
      } else {
        dispatch(saveRound({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(15) }));
      }
    } else {
      setCustomVotingPeriod(true);
      setVotingDuration(15);
      if (editMode) {
        setEditedRound!({ ...round, votePeriodDurationSecs: getSecondsFromDays(15) });
      } else {
        dispatch(saveRound({ ...round, votePeriodDurationSecs: getSecondsFromDays(15) }));
      }
    }
  };

  return (
    <>
      <Group gap={6}>
        <Text type="subtitle">Round start time</Text>

        <DateTimeInput
          onDateChange={handleSelectStartTime}
          selectedDate={startTime === 0 ? null : getDateFromTimestamp(startTime)}
          isValidDate={validStartDate}
        />

        <Text type="body">Round will need to be started manually</Text>
      </Group>

      <Divider />

      <Group gap={6}>
        <Group row>
          <Text type="subtitle">Proposal Period</Text>

          {startTime !== 0 && proposingDuration !== 0 && (
            <>
              <Bullet />
              <p className={classes.date}>{formatDateTime(propEndDate)}</p>
            </>
          )}
        </Group>

        <Group row gap={6} classNames={classes.buttons}>
          {periods.map(length => (
            <TimePeriod
              key={length}
              disabled={startTime === 0}
              days={length}
              selectedPeriod={!customProposingPeriod && proposingDuration === length}
              onClick={() => handleDurationChange(length, true)}
            />
          ))}
          <CustomPeriod
            selectedPeriod={customProposingPeriod}
            disabled={startTime === 0}
            onClick={() => handleSelectCustomPeriod(true)}
          />
          <NumberInput
            value={customProposingPeriod ? proposingDuration : 15}
            handleInputChange={handleProposalInputChange}
            disabled={!customProposingPeriod}
            classNames={classes.customNumberInput}
          />
        </Group>
      </Group>

      <Group gap={6} margin={8} classNames={classes.votingPeriod}>
        <Group row>
          <Text type="subtitle">Voting Period</Text>

          {startTime !== 0 && proposingDuration !== 0 && votingDuration !== 0 && (
            <>
              <Bullet />
              <p className={classes.date}>{formatDateTime(voteEndDate)}</p>
            </>
          )}
        </Group>

        <Group row gap={6} classNames={classes.buttons}>
          {periods.map(length => (
            <TimePeriod
              key={length}
              disabled={proposingDuration === 0}
              days={length}
              selectedPeriod={!customVotingPeriod && votingDuration === length}
              onClick={() => handleDurationChange(length, false)}
            />
          ))}
          <CustomPeriod
            selectedPeriod={customVotingPeriod}
            disabled={proposingDuration === 0}
            onClick={() => handleSelectCustomPeriod(false)}
          />
          <NumberInput
            value={customVotingPeriod ? votingDuration : 15}
            handleInputChange={handleVotingInputChange}
            disabled={!customVotingPeriod}
            classNames={classes.customNumberInput}
          />
        </Group>
      </Group>
    </>
  );
};

export default TimedRoundDateSelector;
