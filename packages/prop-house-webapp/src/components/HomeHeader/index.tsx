import { Col, Row } from 'react-bootstrap';
import classes from './HomeHeader.module.css';
// import { useTranslation } from 'react-i18next';
import { RiSearchLine as SearchIcon } from 'react-icons/ri';

interface HomeHeaderProps {
  input: string;
  handleChange: any;
}

const HomeHeader = ({ input, handleChange }: HomeHeaderProps) => {
  // const { t } = useTranslation();

  return (
    <Row className={classes.wrapper}>
      <Col lg={12} className={classes.leftCol}>
        <h1 className={classes.weeklyFunding}>
          Get funded to{' '}
          <span>
            <span className={classes.build}>build</span>
          </span>
          <br /> with your favorite communities
        </h1>

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
