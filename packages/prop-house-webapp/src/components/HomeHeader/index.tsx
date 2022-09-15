import { Row } from 'react-bootstrap';
import classes from './HomeHeader.module.css';
import HomeTitle from '../HomeTitle';
import HomeStats from '../HomeStats';
import HomeSearchBar from '../HomeSeachBar';
import { StatsProps } from '../pages/Home';

interface HomeHeaderProps {
  input: string;
  handleChange: any;
  stats: StatsProps;
}

const HomeHeader = ({ input, handleChange, stats }: HomeHeaderProps) => {
  return (
    <Row className={classes.wrapper}>
      <HomeTitle />
      <HomeStats stats={stats} />
      <HomeSearchBar input={input} handleChange={handleChange} />
    </Row>
  );
};

export default HomeHeader;
