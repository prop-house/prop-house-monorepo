import clsx from 'clsx';
import { Dispatch, Fragment, SetStateAction } from 'react';
import { Dropdown } from 'react-bootstrap';

import classes from './StatusFilters.module.css';

// We aren't using AuctionStatus enum becuase AuctionStatus[0] is 'not started' and we don't filter by 'not started', rather RoundStatus[0] is the default 'all rounds'
export enum RoundStatus {
  AllRounds,
  Proposing,
  Voting,
  Ended,
}

export interface Status {
  status: RoundStatus;
  title: string;
  bgColor: string;
}

const statuses: Status[] = [
  {
    status: RoundStatus.AllRounds,
    title: 'All rounds',
    bgColor: classes.pink,
  },
  {
    status: RoundStatus.Proposing,
    title: 'Proposing',
    bgColor: classes.green,
  },
  {
    status: RoundStatus.Voting,
    title: 'Voting',
    bgColor: classes.purple,
  },
  {
    status: RoundStatus.Ended,
    title: 'Ended',
    bgColor: classes.black,
  },
];

const StatusFilters: React.FC<{
  numberOfRoundsPerStatus: number[];
  currentRoundStatus: number;
  setCurrentRoundStatus: Dispatch<SetStateAction<RoundStatus>>;
  setInput: (value: string) => void;
}> = props => {
  const { numberOfRoundsPerStatus, currentRoundStatus, setCurrentRoundStatus, setInput } = props;

  const handleClick = (status: RoundStatus) => {
    setInput('');
    setCurrentRoundStatus(status);
  };

  return (
    <>
      {/* desktop */}
      <div className={classes.filters}>
        {statuses.map((s, index) => {
          return (
            <Fragment key={index}>
              <div
                onClick={() => handleClick(s.status)}
                className={clsx(
                  classes.filter,
                  s.bgColor,
                  currentRoundStatus === s.status && classes.active,
                )}
              >
                <div className={classes.filterText}>
                  <span className={classes.filterName}>{s.title}</span>
                  <span className={classes.filterNumber}>{numberOfRoundsPerStatus[index]}</span>
                </div>
              </div>
              {index === 0 && <div className={classes.divider}></div>}
            </Fragment>
          );
        })}
      </div>

      {/* mobile */}
      <div className={clsx(classes.dropdown, 'houseDropdown')}>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {statuses[currentRoundStatus].title}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {statuses.map((s, index) => (
              <Fragment key={index}>
                <Dropdown.Item key={index} onClick={() => handleClick(s.status)}>
                  <span>{s.title}</span>
                  <span className={classes.count}>{numberOfRoundsPerStatus[index]}</span>
                </Dropdown.Item>
              </Fragment>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </>
  );
};

export default StatusFilters;
