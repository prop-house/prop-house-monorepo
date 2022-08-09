import HouseFilters from '../HouseFilters';
import classes from './HouseUtilityBar.module.css';
import { RiSearchLine as SearchIcon } from 'react-icons/ri';
import { useState } from 'react';

export interface HouseUtilityBarProps {
  roundCount: (number | undefined)[];
}

const HouseUtilityBar = ({ roundCount }: HouseUtilityBarProps) => {
  const [input, setInput] = useState<string>('');
  return (
    <div className={classes.houseUtilityBar}>
      <div className={classes.roundFilters}>
        <HouseFilters roundCount={roundCount} />
      </div>

      <div className={classes.searchBar}>
        <span className={classes.searchIcon}>
          <SearchIcon />
        </span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search rounds"
        />
      </div>
    </div>
  );
};

export default HouseUtilityBar;
