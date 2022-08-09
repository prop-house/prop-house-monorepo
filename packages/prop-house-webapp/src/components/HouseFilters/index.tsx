// import clsx from 'clsx';
import clsx from 'clsx';
import { useState } from 'react';
import { HouseUtilityBarProps } from '../HouseUtilityBar';
import classes from './HouseFilters.module.css';
// import { AuctionStatus } from '../../utils/auctionStatus';

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

const HouseFilters = ({ roundCount }: HouseUtilityBarProps) => {
  const [activeId, setActiveId] = useState<number>(0);

  return (
    <>
      {statuses.map((s, index) => (
        <>
          <div
            key={index}
            onClick={() => setActiveId(s.id)}
            className={clsx(classes.filter, s.bgColor, activeId === s.id && classes.active)}
          >
            <div className={classes.filterText}>
              <span className={classes.filterName}>{s.title}</span>
              <span className={classes.filterNumber}>{roundCount[index]}</span>
            </div>
          </div>
          {index === 0 && <div className={classes.divider}></div>}
        </>
      ))}
    </>
  );
};

export default HouseFilters;
