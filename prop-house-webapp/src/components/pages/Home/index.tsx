import { Container } from 'react-bootstrap';
import HomeHeader from '../../HomeHeader';
import Auctions from '../../Auctions';

const Home = () => {
  return (
    <Container>
      <HomeHeader />
      <Auctions />
    </Container>
  );
};

export default Home;
