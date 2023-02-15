import classes from './TimedRound.module.css';
import { useEffect, useState } from 'react';
import Divider from '../../Divider';
import DateTimeInput from '../DateTimeInput';
import Group from '../Group';
import InstructionBox from '../InstructionBox';
import Text from '../Text';
import { validStartDate } from '../../../utils/isValidDate';
import { TimePeriod, CustomPeriod } from '../TimePeriod';
import Flex from '../Flex';
import NumberInput from '../NumberInput';
import { InitialRoundProps } from '../../../state/slices/round';
import Bullet from '../Bullet';
import dayjs from 'dayjs';
import formatDateTime from '../../../utils/formatDateTime';

const TimedRound: React.FC<{
  handleChange: (
    property: keyof InitialRoundProps,
    value: InitialRoundProps[keyof InitialRoundProps],
  ) => void;
  round: InitialRoundProps;
}> = props => {
  const { handleChange, round } = props;

  // PROPOSING PERIOD //
  // the date when the proposal period starts
  const [proposingStartDate, setProposingStartDate] = useState<Date | undefined>(undefined);
  // which proposal period button is selected
  const [selectedProposingPeriod, setSelectedProposingPeriod] = useState<number | null>(null);
  // custom proposal period options in days
  const [proposingPeriodLength, setProposingPeriodLength] = useState<number>(0);
  // the date when the proposal period ends
  const [proposingEndDate, setProposingEndDate] = useState<string>('');
  // default proposal period options in days
  const proposingDays = [5, 7, 14];
  // if we're using a custom proposal period
  const isCustomProposalPeriod = selectedProposingPeriod === 0;
  // if user enters a negative number in the custom proposal period input
  const [proposingInputError, setProposingInputError] = useState(false);

  const handleSelectProposalPeriod = (selectedPeriod: number) => {
    // If the custom period button is selected, reset the voting period state
    if (selectedPeriod === 0) resetVotingPeriod();

    setProposingPeriodLength(selectedPeriod);
    setSelectedProposingPeriod(selectedPeriod);
    setProposingInputError(false);
  };

  // VOTING PERIOD //
  // which voting period button is selected
  const [selectedVotingPeriod, setSelectedVotingPeriod] = useState<number | null>(null);
  // custom voting period options in days
  const [votingPeriodLength, setVotingPeriodLength] = useState<number>(0);
  // the date when the voting period ends
  const [votingEndDate, setVotingEndDate] = useState<string>('');
  // default voting period options in days
  const votingDays = [5, 7, 14];
  // if we're using a custom voting period
  const isCustomVotingPeriod = selectedVotingPeriod === 0;
  // if user enters a negative number in the custom voting period input
  const [votingInputError, setVotingInputError] = useState(false);

  const handleSelectVotingPeriod = (selectedPeriod: number) => {
    setVotingInputError(false);
    setSelectedVotingPeriod(selectedPeriod);
    setVotingPeriodLength(selectedPeriod);
  };

  useEffect(() => {
    // calculate the proposal end date
    if (proposingStartDate) {
      const proposalEndDate = dayjs(proposingStartDate)
        .add(proposingPeriodLength, 'day')
        .toISOString();
      setProposingEndDate(proposalEndDate);
      handleChange('startTime', proposingStartDate.toISOString());
    }

    // calculate the voting end date
    if (proposingEndDate && votingPeriodLength) {
      const votingEndDate = dayjs(proposingEndDate).add(votingPeriodLength, 'day').toISOString();
      setVotingEndDate(votingEndDate);
      handleChange('votingEndTime', votingEndDate);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposingStartDate, proposingPeriodLength, proposingEndDate, votingPeriodLength]);

  const disableVotingPeriod =
    (isCustomProposalPeriod && proposingPeriodLength === 0) ||
    selectedProposingPeriod === null ||
    !round.startTime;

  const resetVotingPeriod = () => {
    setVotingInputError(false);
    setProposingPeriodLength(0);
    setVotingPeriodLength(0);
    setSelectedVotingPeriod(null);
  };

  return (
    <>
      <Group>
        <InstructionBox title="How timing works" text="Your round starts " />
      </Group>

      <Group>
        <Text type="subtitle">Round start time</Text>

        <DateTimeInput
          selectedDate={proposingStartDate}
          onDateChange={setProposingStartDate}
          isValidDate={validStartDate}
        />

        <Text type="body">Round will need to be started manually</Text>
      </Group>

      <Divider />

      <Group>
        <Flex>
          <Text type="subtitle">Proposal Period</Text>
          {proposingInputError ? (
            <>
              <Bullet />
              <p className={classes.date}>{"can't assign negative value"}</p>
            </>
          ) : (
            proposingPeriodLength !== 0 &&
            proposingEndDate && (
              <>
                <Bullet />
                <p className={classes.date}>{formatDateTime(proposingEndDate)}</p>
              </>
            )
          )}
        </Flex>

        <Flex gap={6}>
          {proposingDays.map((day, index) => {
            return (
              <TimePeriod
                key={day}
                disabled={!round.startTime}
                days={day}
                selectedPeriod={selectedProposingPeriod === day}
                onClick={() => handleSelectProposalPeriod(day)}
              />
            );
          })}
          <CustomPeriod
            selectedPeriod={isCustomProposalPeriod}
            disabled={!round.startTime}
            onClick={() => handleSelectProposalPeriod(0)}
          />
          <NumberInput
            value={isCustomProposalPeriod ? proposingPeriodLength : 0}
            setValue={setProposingPeriodLength}
            placeholder={'15'}
            disabled={!isCustomProposalPeriod}
            classNames={classes.customNumberInput}
            setNumberError={setProposingInputError}
            resetVotingPeriod={resetVotingPeriod}
          />
        </Flex>
      </Group>

      {/* VOITNG */}
      <Group>
        <Flex>
          <Text type="subtitle">Voting Period</Text>
          {votingInputError ? (
            <>
              <Bullet />
              <p className={classes.date}>{"can't assign negative value"}</p>
            </>
          ) : (
            votingPeriodLength !== 0 &&
            votingEndDate && (
              <>
                <Bullet />
                <p className={classes.date}>{formatDateTime(votingEndDate)}</p>
              </>
            )
          )}
        </Flex>

        <Flex gap={6}>
          {votingDays.map((day, index) => {
            return (
              <TimePeriod
                key={day}
                disabled={disableVotingPeriod}
                days={day}
                selectedPeriod={selectedVotingPeriod === day}
                onClick={() => handleSelectVotingPeriod(day)}
              />
            );
          })}
          <CustomPeriod
            selectedPeriod={isCustomVotingPeriod}
            disabled={disableVotingPeriod}
            onClick={() => handleSelectVotingPeriod(0)}
          />
          <NumberInput
            value={isCustomVotingPeriod ? votingPeriodLength : 0}
            setValue={setVotingPeriodLength}
            placeholder={'15'}
            disabled={!isCustomVotingPeriod}
            classNames={classes.customNumberInput}
            setNumberError={setVotingInputError}
          />
        </Flex>
      </Group>
    </>
  );
};

export default TimedRound;
