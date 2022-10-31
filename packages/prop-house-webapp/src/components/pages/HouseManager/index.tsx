import classes from './HouseManager.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import ManagerPrimaryCard from '../../ManagerPrimaryCard';
import ManagerSecondaryCard from '../../ManagerSecondaryCard';

const HouseManager = () => {
  return (
    <>
      <Container>
        <Row className={classes.propCardsRow}>
          <Col xl={8} className={classes.cardsContainer}>
            <ManagerPrimaryCard />

            <ManagerSecondaryCard />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HouseManager;
