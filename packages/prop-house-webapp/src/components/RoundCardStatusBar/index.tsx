import { Round, Timed, usePropHouse } from '@prophouse/sdk-react';
import classes from './RoundCardStatusBar.module.css';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { IoTime } from 'react-icons/io5';
import { HiDocument } from 'react-icons/hi';
import clsx from 'clsx';
import { deadlineTime } from '../../utils/auctionStatus';
import diffTime from '../../utils/diffTime';
import RoundStatusPill from '../RoundStatusPill';

const RoundCardStatusBar: React.FC<{ round: Round }> = props => {
  const { round } = props;

  const propHouse = usePropHouse();
  const [numProps, setNumProps] = useState<number | undefined>();

  const notStarted = round.state === Timed.RoundState.NOT_STARTED;
  const ended = round.state > Timed.RoundState.IN_VOTING_PERIOD;

  useEffect(() => {
    if (numProps) return;
    const fetchProps = async () => {
      try {
        setNumProps(await propHouse.query.getRoundProposalCount(round.address));
      } catch (e) {
        console.log(e);
      }
    };
    fetchProps();
  });

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
