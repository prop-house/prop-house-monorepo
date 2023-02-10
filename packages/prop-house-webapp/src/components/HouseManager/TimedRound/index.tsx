import { useState } from 'react';
import Divider from '../../Divider';
import DateTimeInput from '../DateTimeInput';
import Group from '../Group';
import InstructionBox from '../InstructionBox';
import Text from '../Text';
import { validStartDate, validEndDate } from '../../../utils/isValidDate';
import { TimePeriod, CustomPeriod } from '../TimePeriod';
import FlexRow from '../FlexRow';

const TimedRound: React.FC<{}> = () => {
  // need to .toISOString() the date before sending it to the backend
  const [startDate, handleStartDateChange] = useState(new Date());
  const [endDate, handleEndDateChange] = useState(new Date());

  const [proposalPeriod, setProposalPeriod] = useState<number>(-1);
  const [votingPeriod, setVotingPeriod] = useState<number>(0);

  const proposingDays = [5, 7, 14];
  const votingDays = [5, 7, 14];

  return (
    <>
      <Group>
        <InstructionBox title="How timing works" text="Your round starts " />
      </Group>

      <Group>
        <Text type="subtitle">Round start time</Text>

        <DateTimeInput
          selectedDate={startDate}
          onDateChange={handleStartDateChange}
          isValidDate={validStartDate}
        />

        <Text type="body">Round will need to be started manually</Text>
      </Group>

      <Divider />

      <Group>
        <Text type="subtitle">Proposal Period</Text>
        <FlexRow>
          {proposingDays.map((day, index) => {
            return (
              <TimePeriod
                key={index}
                days={day}
                selectedPeriod={proposalPeriod === index}
                onClick={() => setProposalPeriod(index)}
              />
            );
          })}
          <CustomPeriod
            selectedPeriod={proposingDays.length === proposalPeriod}
            onClick={() => {
              setProposalPeriod(proposingDays.length);
            }}
          />
        </FlexRow>

        {proposalPeriod === proposingDays.length && (
          <DateTimeInput
            selectedDate={endDate}
            onDateChange={handleEndDateChange}
            isValidDate={validEndDate(startDate)}
          />
        )}
      </Group>

      <Group>
        <Text type="subtitle">Voting Period</Text>
        <FlexRow>
          {votingDays.map((day, index) => {
            return (
              <TimePeriod
                key={index}
                days={day}
                selectedPeriod={votingPeriod === index}
                onClick={() => setVotingPeriod(index)}
              />
            );
          })}

          <CustomPeriod
            selectedPeriod={votingDays.length === votingPeriod}
            onClick={() => setVotingPeriod(votingDays.length)}
          />
        </FlexRow>

        {votingPeriod === votingDays.length && (
          <DateTimeInput
            selectedDate={endDate}
            onDateChange={handleEndDateChange}
            isValidDate={validEndDate(startDate)}
          />
        )}
      </Group>
    </>
  );
};

export default TimedRound;
