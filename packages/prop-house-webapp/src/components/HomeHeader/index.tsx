import { Row } from 'react-bootstrap';
import classes from './HomeHeader.module.css';
import HomeTitle from '../HomeTitle';
import HomeStats from '../HomeStats';
import HomeSearchBar from '../HomeSeachBar';
import { StatsProps } from '../pages/Home';

interface HomeHeaderProps {
  input: string;
  handleSeachInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stats: StatsProps;
}

const HomeHeader = ({ input, handleSeachInputChange, stats }: HomeHeaderProps) => {
  return (
    <Row className={classes.wrapper}>
      <HomeTitle />
      <HomeStats stats={stats} />
      <HomeSearchBar input={input} handleSeachInputChange={handleSeachInputChange} />
    </Row>
  );
};

export default HomeHeader;
