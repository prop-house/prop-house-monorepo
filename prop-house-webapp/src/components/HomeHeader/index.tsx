import { Col, Row, Image, Button } from 'react-bootstrap';
import grempBulb from '../../assets/gremp-lightbulb.png';

const HomeHeader = () => {
  return (
    <Row>
      <Col xl={6}>
        <h1>Weekly funding for your ideas</h1>
        <p>
          Bring your ideas to life by submitting a proposal to Nouns DAO.
          Auctions are held regularly, and made available to anyone, anywhere.
          Get funded!
        </p>
        <Button>Learn more</Button>
        <Button>Submit Proposal</Button>
      </Col>
      <Col xl={{ span: 4, offset: 1 }}>
        <Image src={grempBulb} fluid />
      </Col>
    </Row>
  );
};

export default HomeHeader;
