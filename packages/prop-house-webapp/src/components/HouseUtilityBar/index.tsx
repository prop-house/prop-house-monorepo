import classes from './HouseUtilityBar.module.css';
import { RiSearchLine as SearchIcon } from 'react-icons/ri';
import StatusFilters, { RoundStatus } from '../StatusFilters';

const HouseUtilityBar: React.FC<{
  numberOfRoundsPerStatus: number[];
  currentRoundStatus: number;
  setCurrentRoundStatus: any;
  setInput: (value: string) => void;
  input?: string;
}> = props => {
  const { numberOfRoundsPerStatus, currentRoundStatus, setCurrentRoundStatus, setInput, input } =
    props;

  const handleChange = (e: any) => {
    setInput(e.target.value);
    setCurrentRoundStatus(RoundStatus.AllRounds);
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
            onChange={e => handleChange(e)}
            placeholder="Search rounds"
          />
        </div>
      </div>
    </div>
  );
};

export default HouseUtilityBar;
