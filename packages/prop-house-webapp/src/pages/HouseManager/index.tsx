import classes from './HouseManager.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import ManagerPrimaryCard from '../../components/ManagerPrimaryCard';
// import ManagerSecondaryCard from '../../components/ManagerSecondaryCard';

const HouseManager = () => {
  return (
    <>
      <Container>
        <Row className={classes.propCardsRow}>
          <Col xl={8} className={classes.cardsContainer}>
            <ManagerPrimaryCard />

            {/* <ManagerSecondaryCard activeStep={activeStep} setActiveStep={setActiveStep} /> */}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HouseManager;
