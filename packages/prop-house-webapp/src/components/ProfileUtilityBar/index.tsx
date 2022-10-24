import classes from './ProfileUtilityBar.module.css';
import { RiSearchLine as SearchIcon } from 'react-icons/ri';
import StatusFilters, { RoundStatus } from '../StatusFilters';
import { Dispatch, SetStateAction } from 'react';

const ProfileUtilityBar: React.FC<{
  numberOfRoundsPerStatus: number[];
  currentRoundStatus: number;
  setCurrentRoundStatus: Dispatch<SetStateAction<RoundStatus>>;
  setInput: (value: string) => void;
  input?: string;
}> = props => {
  const { numberOfRoundsPerStatus, currentRoundStatus, setCurrentRoundStatus, setInput, input } =
    props;

  const handleSearchInputChange = (e: any) => {
    if (currentRoundStatus !== RoundStatus.AllRounds) setCurrentRoundStatus(RoundStatus.AllRounds);
    setInput(e.target.value);
  };

  return (
    <div className={classes.houseUtilityBar}>
      <div className={classes.utilitySection}>
        <StatusFilters
          currentRoundStatus={currentRoundStatus}
          numberOfRoundsPerStatus={numberOfRoundsPerStatus}
          setCurrentRoundStatus={setCurrentRoundStatus}
          setInput={setInput}
        />
      </div>

      <div className={classes.utilitySection}>
        <div className={classes.searchBar}>
          <span className={classes.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            value={input}
            onChange={e => handleSearchInputChange(e)}
            placeholder="Search user's rounds"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileUtilityBar;
