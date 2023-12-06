import { Round, Timed } from '@prophouse/sdk-react';
import StatusPill, { StatusPillColor } from '../StatusPill';

const RoundStatusPill: React.FC<{ round: Round }> = props => {
  const { round } = props;

  const cancelled = round.state === Timed.RoundState.CANCELLED;
  const notStarted = round.state === Timed.RoundState.NOT_STARTED;
  const proposing = round.state === Timed.RoundState.IN_PROPOSING_PERIOD;
  const voting = round.state === Timed.RoundState.IN_VOTING_PERIOD;
  const ended = round.state > Timed.RoundState.IN_VOTING_PERIOD;

  if (cancelled)
    return <StatusPill copy="Cancelled" color={StatusPillColor.Gray} borderRadius={6} />;
  if (notStarted)
    return <StatusPill copy="Not started" color={StatusPillColor.Gray} borderRadius={6} />;
  if (proposing)
    return <StatusPill copy="Proposing" color={StatusPillColor.Green} borderRadius={6} />;
  if (voting) return <StatusPill copy="Voting" color={StatusPillColor.Purple} borderRadius={6} />;
  if (ended) return <StatusPill copy="Complete" color={StatusPillColor.Gray} borderRadius={6} />;
  return <StatusPill copy="Error" color={StatusPillColor.Gray} borderRadius={6} />;
};

export default RoundStatusPill;
