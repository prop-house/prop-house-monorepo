import { Col, Row } from 'react-bootstrap';
import classes from './HomeHeader.module.css';
import { RiSearchLine as SearchIcon } from 'react-icons/ri';
import HomeTitle from '../HomeTitle';

interface HomeHeaderProps {
  input: string;
  handleChange: any;
}

const HomeHeader = ({ input, handleChange }: HomeHeaderProps) => {
  return (
    <Row className={classes.wrapper}>
      <Col lg={12} className={classes.leftCol}>
        <HomeTitle />

        {/* SEARCH */}
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
      </Col>
    </Row>
  );
};

export default HomeHeader;
