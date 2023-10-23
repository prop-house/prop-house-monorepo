import { Round, Timed, usePropHouse } from '@prophouse/sdk-react';
import classes from './RoundCardStatusBar.module.css';
import StatusPill, { StatusPillColor } from '../StatusPill';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { IoTime } from 'react-icons/io5';
import { HiDocument } from 'react-icons/hi';
import clsx from 'clsx';
import { deadlineTime } from '../../utils/auctionStatus';
import diffTime from '../../utils/diffTime';

const RoundCardStatusBar: React.FC<{ round: Round }> = props => {
  const { round } = props;

  const propHouse = usePropHouse();
  const [numProps, setNumProps] = useState<number | undefined>();

  const notStarted = round.state === Timed.RoundState.NOT_STARTED;
  const proposing = round.state === Timed.RoundState.IN_PROPOSING_PERIOD;
  const voting = round.state === Timed.RoundState.IN_VOTING_PERIOD;
  const ended = round.state > Timed.RoundState.IN_VOTING_PERIOD;

  useEffect(() => {
    if (numProps) return;
    const fetchProps = async () => {
      const props = await propHouse.query.getProposalsForRound(round.address);
      setNumProps(props.length);
    };
    fetchProps();
  });

  const statusPill = () => {
    if (notStarted)
      return <StatusPill copy="Not started" color={StatusPillColor.Gray} borderRadius={6} />;
    if (proposing)
      return <StatusPill copy="Proposing" color={StatusPillColor.Green} borderRadius={6} />;
    if (voting) return <StatusPill copy="Voting" color={StatusPillColor.Purple} borderRadius={6} />;
    if (ended) return <StatusPill copy="Complete" color={StatusPillColor.Gray} borderRadius={6} />;
  };

  const copy = () => {
    if (notStarted) {
      const timeLeft = dayjs(round.config.proposalPeriodStartTimestamp * 1000).fromNow();
      return `Round begins ${timeLeft}`;
    }
    if (ended) {
      const timeLeft = dayjs(round.config.votePeriodEndTimestamp * 1000).fromNow();
      return `Round ended ${timeLeft}`;
    }
  };

  return (
    <div className={classes.container}>
      <div className={clsx(classes.content, (notStarted || ended) && classes.textContent)}>
        <div>{statusPill()}</div>
        {notStarted || ended ? (
          <div className={classes.copy}>{copy()}</div>
        ) : (
          <>
            <div className={classes.dataItem}>
              <IoTime /> {diffTime(deadlineTime(round))}
            </div>
            <div className={classes.dataItem}>
              <HiDocument /> {numProps} prop{numProps === 1 ? '' : 's'}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoundCardStatusBar;
