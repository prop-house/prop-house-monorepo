import { HomeHeaderProps } from '../HomeHeader';
import classes from './HomeSearchBar.module.css';
import { RiSearchLine as SearchIcon } from 'react-icons/ri';

const HomeSearchBar = ({ input, handleChange }: HomeHeaderProps) => {
  return (
    <div className={classes.searchBar}>
      <span className={classes.searchIcon}>
        <SearchIcon />
      </span>

      <input
        type="text"
        value={input}
        onChange={e => handleChange(e)}
        placeholder="Search community houses"
      />
    </div>
  );
};

export default HomeSearchBar;
