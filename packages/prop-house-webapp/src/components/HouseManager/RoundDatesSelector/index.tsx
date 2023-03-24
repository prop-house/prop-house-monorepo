import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import Divider from '../../Divider';
import DualSectionSelector from '../DualSectionSelector';
import Group from '../Group';
import Section from '../Section';
import Text from '../Text';
import TimedRound from '../TimedRound';
import { getDayDifference } from '../utils/getDayDifference';

const RoundDatesSelector = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const proposalPeriods = [5, 7, 14];
  const votingPeriods = [5, 7, 14];

  const calculateCustomPeriodState = (
    periodEnd: Date,
    previousPeriodEnd: Date,
    availablePeriods: number[],
  ) => {
    return !availablePeriods.includes(getDayDifference(periodEnd, previousPeriodEnd));
  };
  const [isCustomProposalPeriod, setIsCustomProposalPeriod] = useState(
    round.startTime && round.proposalEndTime
      ? calculateCustomPeriodState(round.proposalEndTime, round.startTime, proposalPeriods)
      : false,
  );
  const [isCustomVotingPeriod, setIsCustomVotingPeriod] = useState(
    round.votingEndTime && round.proposalEndTime
      ? calculateCustomPeriodState(round.votingEndTime, round.proposalEndTime, votingPeriods)
      : false,
  );
  const handlePeriodLengthChange = (length: number, isProposingPeriod: boolean) => {
    if (isProposingPeriod) {
      setIsCustomProposalPeriod(false);
      setProposingPeriodLength(length);
    } else {
      setIsCustomVotingPeriod(false);
      setVotingPeriodLength(length);
    }
  };
  const handleSelectCustomPeriod = (isProposingPeriod: boolean) => {
    if (isProposingPeriod) {
      setIsCustomProposalPeriod(true);
      setProposingPeriodLength(15);
    } else {
      setIsCustomVotingPeriod(true);
      setVotingPeriodLength(15);
    }
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
      dispatch(updateRound({ ...round, startTime: date }));
      dispatch(checkStepCriteria());
    }
  };

  useEffect(() => {
    if (proposingStartTime && proposingPeriodLength !== null) {
      const proposingEndTime = new Date(proposingStartTime);
      proposingEndTime.setDate(proposingEndTime.getDate() + proposingPeriodLength);
      setRoundTime(prevRound => ({ ...prevRound, proposalEnd: proposingEndTime }));
      dispatch(updateRound({ ...round, proposalEndTime: proposingEndTime }));
      dispatch(checkStepCriteria());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposingStartTime, proposingPeriodLength]);

  useEffect(() => {
    if (proposingStartTime && proposingPeriodLength !== null && votingPeriodLength !== null) {
      const votingEndTime = new Date(proposingStartTime);
      votingEndTime.setDate(votingEndTime.getDate() + proposingPeriodLength + votingPeriodLength);
      setRoundTime(prevRound => ({ ...prevRound, votingEnd: votingEndTime }));
      dispatch(updateRound({ ...round, votingEndTime: votingEndTime }));
      dispatch(checkStepCriteria());
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

  const [isTimedRound, setIsTimedRound] = useState(round.timedRound);

  const changeTimingType = () => {
    const updated = {
      ...round,
      timedRound: !round.timedRound,
      startTime: null,
      proposalEndTime: null,
      votingEndTime: null,
    };

    setIsTimedRound(!isTimedRound);
    dispatch(updateRound(updated));
    dispatch(checkStepCriteria());
  };

  const disableVotingPeriod =
    !round.startTime || !round.proposalEndTime || proposingPeriodLength === null;

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

      {isTimedRound ? (
        <TimedRound
          isCustomProposalPeriodDisabled={!round.startTime}
          roundTime={roundTime}
          proposalPeriods={proposalPeriods}
          votingPeriods={votingPeriods}
          proposingPeriodLength={proposingPeriodLength}
          proposingStartTime={proposingStartTime}
          votingPeriodLength={votingPeriodLength}
          isCustomProposalPeriod={isCustomProposalPeriod}
          isCustomVotingPeriod={isCustomVotingPeriod}
          disableVotingPeriod={disableVotingPeriod}
          setProposingPeriodLength={setProposingPeriodLength}
          setVotingPeriodLength={setVotingPeriodLength}
          handlePeriodLengthChange={handlePeriodLengthChange}
          handleSelectCustomPeriod={handleSelectCustomPeriod}
          handleProposingStartTimeChange={handleProposingStartTimeChange}
        />
      ) : (
        !isTimedRound && <div>infinite round</div>
      )}
    </>
  );
};

export default RoundDatesSelector;
