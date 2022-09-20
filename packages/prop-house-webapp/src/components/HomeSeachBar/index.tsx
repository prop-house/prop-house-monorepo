import classes from './HomeSearchBar.module.css';
import { RiSearchLine as SearchIcon } from 'react-icons/ri';

interface HomeSearchBarProps {
  input: string;
  handleSeachInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const HomeSearchBar = ({ input, handleSeachInputChange }: HomeSearchBarProps) => {
  return (
    <div className={classes.searchBar}>
      <span className={classes.searchIcon}>
        <SearchIcon />
      </span>

      <input
        type="text"
        value={input}
        onChange={e => handleSeachInputChange(e)}
        placeholder="Search community houses"
      />
    </div>
  );
};

export default HomeSearchBar;
