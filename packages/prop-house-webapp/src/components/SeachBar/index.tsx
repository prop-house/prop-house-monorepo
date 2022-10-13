import classes from './SearchBar.module.css';
import { RiSearchLine as SearchIcon } from 'react-icons/ri';

interface SearchBarProps {
  input: string;
  handleSeachInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const SearchBar = ({ input, handleSeachInputChange, placeholder }: SearchBarProps) => {
  return (
    <div className={classes.searchBar}>
      <span className={classes.searchIcon}>
        <SearchIcon />
      </span>

      <input
        type="text"
        value={input}
        onChange={e => handleSeachInputChange(e)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
