import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Button, { ButtonColor } from '../../Button';
import Modal from '../../Modal';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';
import { useDispatch } from 'react-redux';
import TimedRound from '../TimedRound';
import { getDayDifference } from '../utils/getDayDifference';

const EditDatesModal: React.FC<{
  setShowEditDatesModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowEditDatesModal } = props;

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleDateSave = () => {
    if (editedRoundTime.start && editedRoundTime.proposalEnd && editedRoundTime.votingEnd) {
      dispatch(
        updateRound({
          ...round,
          startTime: editedRoundTime.start,
          proposalEndTime: editedRoundTime.proposalEnd,
          votingEndTime: editedRoundTime.votingEnd,
        }),
      );
      dispatch(checkStepCriteria());
      setShowEditDatesModal(false);
    }
  };

  const proposalPeriods = [5, 7, 14];
  const votingPeriods = [5, 7, 14];

  const [isCustomProposalPeriod, setIsCustomProposalPeriod] = useState(
    round.startTime &&
      round.proposalEndTime &&
      !proposalPeriods.includes(getDayDifference(round.proposalEndTime, round.startTime))
      ? true
      : false,
  );
  const [isCustomVotingPeriod, setIsCustomVotingPeriod] = useState(
    round.votingEndTime &&
      round.proposalEndTime &&
      !votingPeriods.includes(getDayDifference(round.votingEndTime, round.proposalEndTime))
      ? true
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
  const [editedRoundTime, setEditedRoundTime] = useState({
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
      setEditedRoundTime(prevRound => ({ ...prevRound, start: date }));
      // handleChange('startTime', date.toISOString());
    }
  };

  useEffect(() => {
    if (proposingStartTime && proposingPeriodLength !== null) {
      const proposingEndTime = new Date(proposingStartTime);
      proposingEndTime.setDate(proposingEndTime.getDate() + proposingPeriodLength);
      setEditedRoundTime(prevRound => ({ ...prevRound, proposalEnd: proposingEndTime }));
      // handleChange('proposalEndTime', proposingEndTime.toISOString()); // save to server
      dispatch(checkStepCriteria());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposingStartTime, proposingPeriodLength]);

  useEffect(() => {
    if (proposingStartTime && proposingPeriodLength !== null && votingPeriodLength !== null) {
      const votingEndTime = new Date(proposingStartTime);
      votingEndTime.setDate(votingEndTime.getDate() + proposingPeriodLength + votingPeriodLength);
      setEditedRoundTime(prevRound => ({ ...prevRound, votingEnd: votingEndTime }));
      // handleChange('votingEndTime', votingEndTime.toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposingStartTime, proposingPeriodLength, votingPeriodLength]);

  // useEffect(() => {
  //   if (editedRoundTime.start && editedRoundTime.proposalEnd && editedRoundTime.votingEnd) {
  //     // dispatch(
  //     //   updateRound({
  //     //     ...round,
  //     //     startTime: roundTime.start,
  //     //     proposalEndTime: roundTime.proposalEnd,
  //     //     votingEndTime: roundTime.votingEnd,
  //     //   }),
  //     // );
  //     // setEditedRoundTime({editedRoundTime.start, editedRoundTime.proposalEnd, editedRoundTime.votingEnd});
  //     dispatch(checkStepCriteria());
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [editedRoundTime]);

  const disableVotingPeriod =
    !editedRoundTime.start || !editedRoundTime.proposalEnd || proposingPeriodLength === null;

  return (
    <Modal
      title="Edit round timing"
      subtitle=""
      body={
        <TimedRound
          isCustomProposalPeriodDisabled={!round.startTime}
          proposalPeriods={proposalPeriods}
          votingPeriods={votingPeriods}
          roundTime={editedRoundTime}
          proposingPeriodLength={proposingPeriodLength}
          proposingStartTime={proposingStartTime}
          setProposingPeriodLength={setProposingPeriodLength}
          votingPeriodLength={votingPeriodLength}
          setVotingPeriodLength={setVotingPeriodLength}
          isCustomProposalPeriod={isCustomProposalPeriod}
          isCustomVotingPeriod={isCustomVotingPeriod}
          disableVotingPeriod={disableVotingPeriod}
          handlePeriodLengthChange={handlePeriodLengthChange}
          handleSelectCustomPeriod={handleSelectCustomPeriod}
          handleProposingStartTimeChange={handleProposingStartTimeChange}
        />
      }
      setShowModal={setShowEditDatesModal}
      button={
        <Button
          text={'Cancel'}
          bgColor={ButtonColor.Black}
          onClick={() => setShowEditDatesModal(false)}
        />
      }
      secondButton={
        <Button
          text={'Save Changes'}
          bgColor={ButtonColor.Pink}
          onClick={handleDateSave}
          disabled={
            !(editedRoundTime.start && editedRoundTime.proposalEnd && editedRoundTime.votingEnd)
          }
        />
      }
    />
  );
};

export default EditDatesModal;
