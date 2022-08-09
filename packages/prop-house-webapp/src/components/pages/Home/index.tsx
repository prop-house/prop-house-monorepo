import HomeHeader from '../../HomeHeader';
import CommunityCarousel from '../../CommunityCarousel';
import PropCarousel from '../../PropCarousel';
import ContactUsCTA from '../../ContactUsCTA';
import { Container } from 'react-bootstrap';

const Home = () => {
  return (
    <>
      <Container>
        <HomeHeader />
        <CommunityCarousel />
        <PropCarousel />
        <ContactUsCTA />
      </Container>
    </>
  );
};

export default Home;
