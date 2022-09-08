import clsx from 'clsx';
import { HouseUtilityBarProps } from '../HouseUtilityBar';
import classes from './HouseFilters.module.css';

const statuses = [
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

const HouseFilters = ({
  roundCountByStatus,
  currentRoundStatus,
  setCurrentRoundStatus,
  setInput,
}: HouseUtilityBarProps) => {
  const handleClick = (id: number) => {
    setInput('');

    setCurrentRoundStatus(id);
  };

  return (
    <>
      {statuses.map((s, index) => {
        return (
          <>
            <div
              key={index}
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
          </>
        );
      })}
    </>
  );
};

export default HouseFilters;
