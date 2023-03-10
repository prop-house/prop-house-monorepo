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

const TimedRound: React.FC<{
  isCustomProposalPeriodDisabled: boolean;
  proposalPeriods: number[];
  votingPeriods: number[];
  roundTime: { start: Date | null; proposalEnd: Date | null; votingEnd: Date | null };
  proposingStartTime: Date | null;
  proposingPeriodLength: number | null;
  votingPeriodLength: number | null;
  isCustomProposalPeriod: boolean;
  isCustomVotingPeriod: boolean;
  disableVotingPeriod: boolean;
  setProposingPeriodLength: (length: number) => void;
  setVotingPeriodLength: (length: number) => void;
  handlePeriodLengthChange: (length: number, isProposingPeriod: boolean) => void;
  handleSelectCustomPeriod: (isProposingPeriod: boolean) => void;
  handleProposingStartTimeChange: (date: Date) => void;
}> = props => {
  const {
    isCustomProposalPeriodDisabled,
    proposalPeriods,
    roundTime,
    proposingPeriodLength,
    votingPeriodLength,
    votingPeriods,
    proposingStartTime,
    isCustomProposalPeriod,
    isCustomVotingPeriod,
    disableVotingPeriod,
    handlePeriodLengthChange,
    handleSelectCustomPeriod,
    setProposingPeriodLength,
    setVotingPeriodLength,
    handleProposingStartTimeChange,
  } = props;

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

        <Group row gap={6} classNames={classes.buttons}>
          {proposalPeriods.map(length => (
            <TimePeriod
              key={length}
              disabled={!proposingStartTime}
              days={length}
              selectedPeriod={!isCustomProposalPeriod && proposingPeriodLength === length}
              onClick={() => handlePeriodLengthChange(length, true)}
            />
          ))}
          <CustomPeriod
            selectedPeriod={isCustomProposalPeriod}
            disabled={isCustomProposalPeriodDisabled}
            onClick={() => handleSelectCustomPeriod(true)}
          />
          <NumberInput
            value={isCustomProposalPeriod ? proposingPeriodLength! : 15}
            setValue={setProposingPeriodLength}
            disabled={!isCustomProposalPeriod}
            classNames={classes.customNumberInput}
          />
        </Group>
      </Group>

      <Group gap={6} margin={8} classNames={classes.votingPeriod}>
        <Group row>
          <Text type="subtitle">Voting Period</Text>
          {votingPeriodLength !== 0 && roundTime.votingEnd && (
            <>
              <Bullet />
              <p className={classes.date}>{formatDateTime(roundTime.votingEnd)}</p>
            </>
          )}
        </Group>

        <Group row gap={6} classNames={classes.buttons}>
          {votingPeriods.map(length => (
            <TimePeriod
              key={length}
              disabled={!proposingStartTime || proposingPeriodLength === null}
              days={length}
              selectedPeriod={!isCustomVotingPeriod && votingPeriodLength === length}
              onClick={() => handlePeriodLengthChange(length, false)}
            />
          ))}
          <CustomPeriod
            selectedPeriod={isCustomVotingPeriod}
            disabled={disableVotingPeriod}
            onClick={() => handleSelectCustomPeriod(false)}
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
