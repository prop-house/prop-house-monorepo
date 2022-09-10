import { Row } from 'react-bootstrap';
import classes from './HomeHeader.module.css';
import HomeTitle from '../HomeTitle';
import HomeStats from '../HomeStats';
import HomeSearchBar from '../HomeSeachBar';

export interface HomeHeaderProps {
  input: string;
  handleChange: any;
}

const HomeHeader = ({ input, handleChange }: HomeHeaderProps) => {
  return (
    <Row className={classes.wrapper}>
      <HomeTitle />
      <HomeStats />
      <HomeSearchBar input={input} handleChange={handleChange} />
    </Row>
  );
};

export default HomeHeader;
