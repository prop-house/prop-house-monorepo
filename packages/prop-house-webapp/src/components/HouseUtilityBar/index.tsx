import HouseFilters from '../HouseFilters';
import classes from './HouseUtilityBar.module.css';
import { RiSearchLine as SearchIcon } from 'react-icons/ri';
import HouseDropdown from '../HouseDropdown';
import clsx from 'clsx';

export interface HouseUtilityBarProps {
  roundCount: (number | undefined)[];
  roundStatus: number;
  setRoundStatus: any;
  input?: any;
  setInput?: any;
}

const HouseUtilityBar = ({
  roundCount,
  roundStatus,
  setRoundStatus,
  input,
  setInput,
}: HouseUtilityBarProps) => {
  const handleChange = (e: any) => {
    setInput(e.target.value);
    setRoundStatus(0);
  };

  return (
    <div className={classes.houseUtilityBar}>
      <div className={classes.utilitySection}>
        <div className={classes.filters}>
          <HouseFilters
            roundStatus={roundStatus}
            roundCount={roundCount}
            setRoundStatus={setRoundStatus}
            setInput={setInput}
          />
        </div>

        <div className={clsx(classes.dropdown, 'houseDropdown')}>
          <HouseDropdown
            roundStatus={roundStatus}
            roundCount={roundCount}
            setRoundStatus={setRoundStatus}
            setInput={setInput}
          />
        </div>
      </div>

      <div className={classes.utilitySection}>
        <div className={classes.searchBar}>
          <span className={classes.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            value={input}
            onChange={e => handleChange(e)}
            placeholder="Search rounds"
          />
        </div>
      </div>
    </div>
  );
};

export default HouseUtilityBar;
