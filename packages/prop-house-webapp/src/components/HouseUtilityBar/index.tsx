import HouseFilters from '../HouseFilters';
import classes from './HouseUtilityBar.module.css';
import { RiSearchLine as SearchIcon } from 'react-icons/ri';
import HouseDropdown from '../HouseDropdown';
import clsx from 'clsx';

export interface HouseUtilityBarProps {
  roundCountByStatus: (number | undefined)[];
  currentRoundStatus: number;
  setCurrentRoundStatus: any;
  input?: any;
  setInput?: any;
}

const HouseUtilityBar = ({
  roundCountByStatus,
  currentRoundStatus,
  setCurrentRoundStatus,
  input,
  setInput,
}: HouseUtilityBarProps) => {
  const handleChange = (e: any) => {
    setInput(e.target.value);
    setCurrentRoundStatus(0);
  };

  return (
    <div className={classes.houseUtilityBar}>
      <div className={classes.utilitySection}>
        <div className={classes.filters}>
          <HouseFilters
            currentRoundStatus={currentRoundStatus}
            roundCountByStatus={roundCountByStatus}
            setCurrentRoundStatus={setCurrentRoundStatus}
            setInput={setInput}
          />
        </div>

        <div className={clsx(classes.dropdown, 'houseDropdown')}>
          <HouseDropdown
            currentRoundStatus={currentRoundStatus}
            roundCountByStatus={roundCountByStatus}
            setCurrentRoundStatus={setCurrentRoundStatus}
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
