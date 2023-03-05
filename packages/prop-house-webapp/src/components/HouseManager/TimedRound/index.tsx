import classes from './TimedRound.module.css';
import 'react-datetime/css/react-datetime.css';
import { useEffect, useState } from 'react';
import Divider from '../../Divider';
import DateTimeInput from '../DateTimeInput';
import Group from '../Group';
import InstructionBox from '../InstructionBox';
import Text from '../Text';
import { validStartDate } from '../../../utils/isValidDate';
import { TimePeriod, CustomPeriod } from '../TimePeriod';
import NumberInput from '../NumberInput';
import { checkStepCriteria, InitialRoundProps, updateRound } from '../../../state/slices/round';
import Bullet from '../Bullet';
import dayjs from 'dayjs';
import formatDateTime from '../../../utils/formatDateTime';
import { useDispatch } from 'react-redux';

const TimedRound: React.FC<{
  handleChange: (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => void;
  round: InitialRoundProps;
}> = props => {
  const { handleChange, round } = props;

  const getDayDifference = (date1: Date, date2: Date) => dayjs(date1).diff(dayjs(date2), 'd');

  const dispatch = useDispatch();

  const ProposalPeriodLengths = [5, 7, 14];
  const VotingPeriodLengths = [5, 7, 14];

  const [isCustomProposalPeriod, setIsCustomProposalPeriod] = useState(
    round.startTime &&
      round.proposalEndTime &&
      !ProposalPeriodLengths.includes(getDayDifference(round.proposalEndTime, round.startTime))
      ? true
      : false,
  );
  const handleProposingPeriodLengthChange = (length: number) => {
    setIsCustomProposalPeriod(false);
    setProposingPeriodLength(length);
  };
  const handleVotingPeriodLengthChange = (length: number) => {
    setIsCustomVotingPeriod(false);
    setVotingPeriodLength(length);
  };

  const [isCustomVotingPeriod, setIsCustomVotingPeriod] = useState(
    round.votingEndTime &&
      round.proposalEndTime &&
      !VotingPeriodLengths.includes(getDayDifference(round.votingEndTime, round.proposalEndTime))
      ? true
      : false,
  );
  const handleSelectCustomProposalPeriod = () => {
    setIsCustomProposalPeriod(true);
    setProposingPeriodLength(15);
  };
  const handleSelectCustomVotingPeriod = () => {
    setIsCustomVotingPeriod(true);
    setVotingPeriodLength(15);
  };

  const [roundTime, setRoundTime] = useState({
    start: round.startTime ? round.startTime : null,
    proposalEnd: round.proposalEndTime ? round.proposalEndTime : null,
    votingEnd: round.votingEndTime ? round.votingEndTime : null,
  });
  const [proposingStartTime, setProposingStartTime] = useState<Date | null>(
    round.startTime ? new Date(round.startTime) : null,
  );
  const [proposingPeriodLength, setProposingPeriodLength] = useState<number | null>(
    round.startTime && round.proposalEndTime
      ? getDayDifference(round.proposalEndTime, round.startTime)
      : null,
  );
  const [votingPeriodLength, setVotingPeriodLength] = useState<number | null>(
    round.votingEndTime && round.proposalEndTime
      ? getDayDifference(round.votingEndTime, round.proposalEndTime)
      : null,
  );

  const handleProposingStartTimeChange = (date: Date | null) => {
    if (date) {
      setProposingStartTime(date);
      setRoundTime(prevRound => ({ ...prevRound, start: date }));
      handleChange('startTime', date.toISOString());
    }
  };

  useEffect(() => {
    if (proposingStartTime && proposingPeriodLength !== null) {
      const proposingEndTime = new Date(proposingStartTime);
      proposingEndTime.setDate(proposingEndTime.getDate() + proposingPeriodLength);
      setRoundTime(prevRound => ({ ...prevRound, proposalEnd: proposingEndTime }));
      handleChange('proposalEndTime', proposingEndTime.toISOString()); // save to server
      dispatch(checkStepCriteria());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposingStartTime, proposingPeriodLength]);

  useEffect(() => {
    if (proposingStartTime && proposingPeriodLength !== null && votingPeriodLength !== null) {
      const votingEndTime = new Date(proposingStartTime);
      votingEndTime.setDate(votingEndTime.getDate() + proposingPeriodLength + votingPeriodLength);
      setRoundTime(prevRound => ({ ...prevRound, votingEnd: votingEndTime }));
      handleChange('votingEndTime', votingEndTime.toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposingStartTime, proposingPeriodLength, votingPeriodLength]);

  useEffect(() => {
    if (roundTime.start && roundTime.proposalEnd && roundTime.votingEnd) {
      dispatch(
        updateRound({
          ...round,
          startTime: roundTime.start,
          proposalEndTime: roundTime.proposalEnd,
          votingEndTime: roundTime.votingEnd,
        }),
      );
      dispatch(checkStepCriteria());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundTime]);

  const disableVotingPeriod =
    !round.startTime || !round.proposalEndTime || proposingPeriodLength === null;

  return (
    <>
      <Group margin={16}>
        <InstructionBox title="How timing works" text="Your round starts " />
      </Group>

      <Group gap={6}>
        <Text type="subtitle">Round start time</Text>

        <DateTimeInput
          selectedDate={proposingStartTime}
          onDateChange={handleProposingStartTimeChange}
          isValidDate={validStartDate}
        />
        <Text type="body">Round will need to be started manually</Text>
      </Group>

      <Divider />

      <Group gap={6}>
        <Group row>
          <Text type="subtitle">Proposal Period</Text>

          {proposingPeriodLength !== 0 && roundTime.proposalEnd && (
            <>
              <Bullet />
              <p className={classes.date}>{formatDateTime(roundTime.proposalEnd)}</p>
            </>
          )}
        </Group>

        <Group row gap={6}>
          {ProposalPeriodLengths.map(length => (
            <TimePeriod
              key={length}
              disabled={!proposingStartTime}
              days={length}
              selectedPeriod={!isCustomProposalPeriod && proposingPeriodLength === length}
              onClick={() => handleProposingPeriodLengthChange(length)}
            />
          ))}
          <CustomPeriod
            selectedPeriod={isCustomProposalPeriod}
            disabled={!round.startTime}
            onClick={() => handleSelectCustomProposalPeriod()}
          />
          <NumberInput
            value={isCustomProposalPeriod ? proposingPeriodLength! : 15}
            setValue={setProposingPeriodLength}
            disabled={!isCustomProposalPeriod}
            classNames={classes.customNumberInput}
          />
        </Group>
      </Group>

      <Group gap={6} mt={8}>
        <Group row>
          <Text type="subtitle">Voting Period</Text>
          {votingPeriodLength !== 0 && roundTime.votingEnd && (
            <>
              <Bullet />
              <p className={classes.date}>{formatDateTime(roundTime.votingEnd)}</p>
            </>
          )}
        </Group>

        <Group row gap={6}>
          {VotingPeriodLengths.map(length => (
            <TimePeriod
              key={length}
              disabled={!proposingStartTime || proposingPeriodLength === null}
              days={length}
              selectedPeriod={!isCustomVotingPeriod && votingPeriodLength === length}
              onClick={() => handleVotingPeriodLengthChange(length)}
            />
          ))}
          <CustomPeriod
            selectedPeriod={isCustomVotingPeriod}
            disabled={disableVotingPeriod}
            onClick={() => handleSelectCustomVotingPeriod()}
          />
          <NumberInput
            value={isCustomVotingPeriod ? votingPeriodLength! : 15}
            setValue={setVotingPeriodLength}
            disabled={!isCustomVotingPeriod}
            classNames={classes.customNumberInput}
          />
        </Group>
      </Group>
    </>
  );
};

export default TimedRound;
