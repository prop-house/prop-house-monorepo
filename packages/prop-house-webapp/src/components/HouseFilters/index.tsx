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
  roundCount,
  roundStatus,
  setRoundStatus,
  setInput,
}: HouseUtilityBarProps) => {
  const handleClick = (id: number) => {
    setInput('');

    setRoundStatus(id);
  };

  return (
    <>
      {statuses.map((s, index) => {
        return (
          <>
            <div
              key={index}
              onClick={() => handleClick(s.id)}
              className={clsx(classes.filter, s.bgColor, roundStatus === s.id && classes.active)}
            >
              <div className={classes.filterText}>
                <span className={classes.filterName}>{s.title}</span>
                <span className={classes.filterNumber}>{roundCount[index]}</span>
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
