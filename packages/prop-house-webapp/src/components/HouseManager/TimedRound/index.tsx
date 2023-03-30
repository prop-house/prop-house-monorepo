import classes from './TimedRound.module.css';
import 'react-datetime/css/react-datetime.css';
import Divider from '../../Divider';
import DateTimeInput from '../DateTimeInput';
import Group from '../Group';
import InstructionBox from '../InstructionBox';
import Text from '../Text';
import { validStartDate } from '../../../utils/isValidDate';
import { TimePeriod, CustomPeriod } from '../TimePeriod';
import NumberInput from '../NumberInput';
import Bullet from '../Bullet';
import formatDateTime from '../../../utils/formatDateTime';
import { getDateFromTimestamp } from '../utils/getDateFromTimestamp';
import { getSecondsFromDays } from '../utils/getSecondsFromDays';
import { checkStepCriteria, NewRound, updateRound } from '../../../state/slices/round';
import { useState } from 'react';
import { getDateFromDuration } from '../utils/getDateFromDuration';
import { getDaysFromSeconds } from '../utils/getDaysFromSeconds';
import { getDurationBetweenDatesInSeconds } from '../utils/getDurationBetweenDatesInSeconds';
import { getTimestampFromDate } from '../utils/getTimestampFromDate';
import { useDispatch } from 'react-redux';

const TimedRound: React.FC<{
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
      : !periods.includes(
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
      : !periods.includes(
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
    if (editMode) {
      setEditedRound!({ ...round, proposalPeriodStartUnixTimestamp: getTimestampFromDate(date) });
    } else {
      dispatch(
        updateRound({ ...round, proposalPeriodStartUnixTimestamp: getTimestampFromDate(date) }),
      );
      dispatch(checkStepCriteria());
    }
  };

  const handleDurationChange = (duration: number, isProposingPeriod: boolean) => {
    if (isProposingPeriod) {
      setCustomProposingPeriod(false);
      setProposingDuartion(duration);
      if (editMode) {
        setEditedRound!({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(duration) });
      } else {
        dispatch(
          updateRound({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(duration) }),
        );
        dispatch(checkStepCriteria());
      }
    } else {
      setCustomVotingPeriod(false);
      setVotingDuration(duration);
      if (editMode) {
        setEditedRound!({ ...round, votePeriodDurationSecs: getSecondsFromDays(duration) });
      } else {
        dispatch(updateRound({ ...round, votePeriodDurationSecs: getSecondsFromDays(duration) }));
        dispatch(checkStepCriteria());
      }
    }
  };

  const handleProposalInputChange = (duration: number) => {
    setProposingDuartion(duration);
    if (editMode) {
      setEditedRound!({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(duration) });
    } else {
      dispatch(updateRound({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(duration) }));
      dispatch(checkStepCriteria());
    }
  };
  const handleVotingInputChange = (duration: number) => {
    setVotingDuration(duration);
    if (editMode) {
      setEditedRound!({ ...round, votePeriodDurationSecs: getSecondsFromDays(duration) });
    } else {
      dispatch(updateRound({ ...round, votePeriodDurationSecs: getSecondsFromDays(duration) }));
      dispatch(checkStepCriteria());
    }
  };

  const handleSelectCustomPeriod = (isProposingPeriod: boolean) => {
    if (isProposingPeriod) {
      setCustomProposingPeriod(true);
      setProposingDuartion(15);
      if (editMode) {
        setEditedRound!({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(15) });
      } else {
        dispatch(updateRound({ ...round, proposalPeriodDurationSecs: getSecondsFromDays(15) }));
        dispatch(checkStepCriteria());
      }
    } else {
      setCustomVotingPeriod(true);
      setVotingDuration(15);
      if (editMode) {
        setEditedRound!({ ...round, votePeriodDurationSecs: getSecondsFromDays(15) });
      } else {
        dispatch(updateRound({ ...round, votePeriodDurationSecs: getSecondsFromDays(15) }));
        dispatch(checkStepCriteria());
      }
    }
  };

  return (
    <>
      <Group margin={16}>
        <InstructionBox title="How timing works" text="Your round starts " />
      </Group>

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

export default TimedRound;
