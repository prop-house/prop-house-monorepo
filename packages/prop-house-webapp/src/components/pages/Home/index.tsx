import HomeHeader from '../../HomeHeader';
import { Container } from 'react-bootstrap';
import CommunityCardGrid from '../../CommunityCardGrid';
import { useState } from 'react';

const Home = () => {
  const [input, setInput] = useState('');

  const handleChange = (e: any) => {
    setInput(e.target.value);
  };

  return (
    <>
      <Container>
        <HomeHeader input={input} handleChange={handleChange} />
        <CommunityCardGrid input={input} />
      </Container>
    </>
  );
};

export default Home;
