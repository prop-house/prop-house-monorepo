import clsx from 'clsx';
import { Fragment } from 'react';
import { Dropdown } from 'react-bootstrap';
import classes from './StatusFilters.module.css';

export interface Status {
  id: number;
  title: string;
  bgColor: string;
}

const statuses: Status[] = [
  {
    id: 0,
    title: 'All rounds',
    bgColor: classes.pink,
  },
  {
    id: 1,
    title: 'Proposing',
    bgColor: classes.green,
  },
  {
    id: 2,
    title: 'Voting',
    bgColor: classes.purple,
  },
  {
    id: 3,
    title: 'Ended',
    bgColor: classes.black,
  },
];

const StatusFilters: React.FC<{
  roundCountByStatus: number[];
  currentRoundStatus: number;
  setCurrentRoundStatus: any;
  setInput: (value: string) => void;
}> = props => {
  const { roundCountByStatus, currentRoundStatus, setCurrentRoundStatus, setInput } = props;

  const handleClick = (id: number) => {
    setInput('');

    setCurrentRoundStatus(id);
  };

  return (
    <>
      {/* desktop */}
      <div className={classes.filters}>
        {statuses.map((s, index) => {
          return (
            <Fragment key={index}>
              <div
                onClick={() => handleClick(s.id)}
                className={clsx(
                  classes.filter,
                  s.bgColor,
                  currentRoundStatus === s.id && classes.active,
                )}
              >
                <div className={classes.filterText}>
                  <span className={classes.filterName}>{s.title}</span>
                  <span className={classes.filterNumber}>{roundCountByStatus[index]}</span>
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
                <Dropdown.Item key={index} onClick={() => handleClick(s.id)}>
                  <span>{s.title}</span>
                  <span className={classes.count}>{roundCountByStatus[index]}</span>
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
