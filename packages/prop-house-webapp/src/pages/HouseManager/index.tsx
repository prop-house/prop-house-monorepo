import classes from './HouseManager.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import PrimaryCard from '../../components/HouseManager/PrimaryCard';
import SecondaryCard from '../../components/HouseManager/SecondaryCard';

const HouseManager = () => {
  return (
    <div className="manager">
      <Container>
        <Row>
          <Col xl={8} className={classes.cardsContainer}>
            <PrimaryCard />
            <SecondaryCard />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HouseManager;
