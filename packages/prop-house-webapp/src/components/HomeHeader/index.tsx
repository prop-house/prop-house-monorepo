import { Container, Row } from 'react-bootstrap';
import classes from './HomeHeader.module.css';
import HomeTitle from '../HomeTitle';
import HomeStats from '../HomeStats';
import HomeSearchBar from '../HomeSeachBar';
import { StatsProps } from '../pages/Home';
import { useNavigate } from 'react-router-dom';

interface HomeHeaderProps {
  input: string;
  handleSeachInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stats: StatsProps;
}

const HomeHeader = ({ input, handleSeachInputChange, stats }: HomeHeaderProps) => {
  const navigate = useNavigate();

  return (
    <Row className={classes.wrapper}>
      <HomeTitle />
      <button className={classes.learnMoreBtn} onClick={() => navigate('/faq')}>
        Learn more →
      </button>
      <HomeStats stats={stats} />
      <Container className={classes.searchBarContainer}>
        <HomeSearchBar input={input} handleSeachInputChange={handleSeachInputChange} />
      </Container>
    </Row>
  );
};

export default HomeHeader;
